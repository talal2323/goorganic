const reasonLabels = {
    PHONE: 'Phone Number',
    EMAIL: 'Email Address',
    BANK_NAME: 'Bank Name',
    WALLET_NAME: 'Wallet Name',
    OFF_PLATFORM_REQUEST: 'Off-Platform Payment Request'
};

export const getFilterReasonLabel = (reason) => reasonLabels[reason] || 'Sensitive Content';

export const blockedMessageText =
    'Sensitive contact or payment details were blocked to keep transactions safe on GOorganic.';
