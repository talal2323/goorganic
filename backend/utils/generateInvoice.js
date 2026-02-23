import PDFDocument from 'pdfkit';

/**
 * Generate a PDF invoice for an order
 * @param {Object} order - The order object with customer details
 * @param {Array} subOrders - Array of sub-orders with vendor and items
 * @returns {PDFDocument} - The PDF document stream
 */
export const generateInvoice = (order, subOrders) => {
    const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        compress: true
    });

    // Header - Company Logo & Info
    doc.fontSize(24)
        .fillColor('#2d6a4f')
        .text('GOorganic', 50, 50, { align: 'left' })
        .fontSize(10)
        .fillColor('#6b7280')
        .text('Fresh Organic Products', 50, 80)
        .text('goorganic.co.pk@gmail.com', 50, 95);

    // Invoice Title
    doc.fontSize(20)
        .fillColor('#000000')
        .text('INVOICE', 400, 50, { align: 'right' });

    // Order Number and Date
    doc.fontSize(10)
        .fillColor('#6b7280')
        .text(`Order Number: ${order.orderNumber || `#${order._id.toString().slice(-8).toUpperCase()}`}`, 400, 75, { align: 'right' })
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 400, 90, { align: 'right' });

    // Horizontal line
    doc.strokeColor('#e5e7eb')
        .lineWidth(1)
        .moveTo(50, 120)
        .lineTo(545, 120)
        .stroke();

    // Customer Information
    let yPos = 140;
    doc.fontSize(12)
        .fillColor('#000000')
        .text('Bill To:', 50, yPos, { underline: true });

    yPos += 20;
    doc.fontSize(10)
        .fillColor('#374151')
        .text(order.customer.name || 'Customer', 50, yPos);

    yPos += 15;
    if (order.customer.email) {
        doc.text(order.customer.email, 50, yPos);
        yPos += 15;
    }

    doc.text(order.phoneNumber, 50, yPos);
    yPos += 25;

    // Shipping Address
    doc.fontSize(12)
        .fillColor('#000000')
        .text('Ship To:', 50, yPos, { underline: true });

    yPos += 20;
    doc.fontSize(10)
        .fillColor('#374151')
        .text(order.shippingAddress.address, 50, yPos, { width: 250 });
    yPos += 15;
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`, 50, yPos);
    yPos += 15;
    doc.text(order.shippingAddress.country, 50, yPos);

    yPos += 30;

    // Payment Information Box
    doc.fontSize(11)
        .fillColor('#000000')
        .text('Payment Method:', 350, 140);
    doc.fontSize(10)
        .fillColor('#374151')
        .text(order.paymentMethod === 'Stripe' ? 'Online Payment (Stripe)' : 'Cash on Delivery', 350, 160);

    doc.fontSize(11)
        .fillColor('#000000')
        .text('Payment Status:', 350, 185);
    doc.fontSize(10)
        .fillColor(order.paymentStatus === 'Completed' ? '#16a34a' : '#f59e0b')
        .text(order.paymentStatus, 350, 205);

    // Items Table Header
    yPos = Math.max(yPos, 240);
    doc.fontSize(11)
        .fillColor('#ffffff')
        .rect(50, yPos, 495, 25)
        .fill('#2d6a4f');

    doc.fontSize(10)
        .fillColor('#ffffff')
        .text('Item', 60, yPos + 8)
        .text('Vendor', 250, yPos + 8)
        .text('Qty', 370, yPos + 8)
        .text('Price', 420, yPos + 8)
        .text('Total', 490, yPos + 8, { align: 'right', width: 45 });

    yPos += 25;

    // Items from Sub-Orders
    let subtotal = 0;

    subOrders.forEach((subOrder) => {
        const vendorName = subOrder.vendor?.shopName || subOrder.vendor?.name || 'Vendor';

        subOrder.items.forEach((item) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            // Check if we need a new page
            if (yPos > 700) {
                doc.addPage();
                yPos = 50;
            }

            // Alternating row background
            if (Math.floor((yPos - 265) / 20) % 2 === 0) {
                doc.rect(50, yPos, 495, 20).fill('#f9fafb');
            }

            doc.fontSize(9)
                .fillColor('#374151')
                .text(item.name, 60, yPos + 5, { width: 180, ellipsis: true })
                .text(vendorName, 250, yPos + 5, { width: 110, ellipsis: true })
                .text(item.quantity.toString(), 370, yPos + 5)
                .text(`Rs. ${item.price.toLocaleString()}`, 420, yPos + 5)
                .text(`Rs. ${itemTotal.toLocaleString()}`, 490, yPos + 5, { align: 'right', width: 45 });

            yPos += 20;
        });
    });

    // Check if we need space for totals
    if (yPos > 650) {
        doc.addPage();
        yPos = 50;
    }

    // Totals Section
    yPos += 10;
    doc.strokeColor('#e5e7eb')
        .lineWidth(1)
        .moveTo(350, yPos)
        .lineTo(545, yPos)
        .stroke();

    yPos += 15;
    doc.fontSize(10)
        .fillColor('#374151')
        .text('Subtotal:', 350, yPos)
        .text(`Rs. ${subtotal.toLocaleString()}`, 445, yPos, { align: 'right', width: 100 });

    yPos += 20;
    doc.fontSize(10)
        .fillColor('#374151')
        .text('Shipping Fee:', 350, yPos)
        .text(`Rs. ${(order.shippingFee || 0).toLocaleString()}`, 445, yPos, { align: 'right', width: 100 });

    yPos += 20;
    doc.strokeColor('#2d6a4f')
        .lineWidth(2)
        .moveTo(350, yPos)
        .lineTo(545, yPos)
        .stroke();

    yPos += 10;
    doc.fontSize(12)
        .fillColor('#000000')
        .text('Total Amount:', 350, yPos, { bold: true })
        .fontSize(14)
        .fillColor('#2d6a4f')
        .text(`Rs. ${order.totalAmount.toLocaleString()}`, 445, yPos, { align: 'right', width: 100 });

    // Footer
    const footerY = 750;
    doc.fontSize(8)
        .fillColor('#9ca3af')
        .text('Thank you for shopping with GOorganic!', 50, footerY, { align: 'center', width: 495 })
        .text('For any queries, contact us at goorganic.co.pk@gmail.com', 50, footerY + 12, { align: 'center', width: 495 });

    // Page numbers (if multiple pages)
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
            .fillColor('#9ca3af')
            .text(`Page ${i + 1} of ${pages.count}`, 50, 780, { align: 'center', width: 495 });
    }

    return doc;
};
