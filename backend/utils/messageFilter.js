import { bankKeywords, walletKeywords, offPlatformKeywords } from '../config/paymentFilterKeywords.js';

const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const phoneRegex = /(\+?\d{1,4}[\s.-]?)?(\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,6}/g;

const normalizeText = (value = '') =>
    value
        .toLowerCase()
        .replace(/[_.,;:!?()[\]{}-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const buildReasonMap = () => ({
    PHONE: [],
    EMAIL: [],
    BANK_NAME: [],
    WALLET_NAME: [],
    OFF_PLATFORM_REQUEST: []
});

const matchKeywords = (normalizedText, keywords, reasonBucket) => {
    keywords.forEach((keyword) => {
        if (normalizedText.includes(keyword)) {
            reasonBucket.push(keyword);
        }
    });
};

const extractDigitsOnly = (text) => {
    return String(text).replace(/\D/g, '');
};

export const filterMessage = (messageText = '') => {
    const trimmed = String(messageText).trim();
    const reasonMap = buildReasonMap();

    if (!trimmed) {
        return {
            isBlocked: false,
            sanitizedText: '',
            reasons: [],
            matchedTerms: []
        };
    }

    // Block messages that contain ONLY digits (no text)
    // This prevents users from sending phone numbers split across multiple digit-only messages
    if (/^\d+$/.test(trimmed)) {
        reasonMap.PHONE.push(trimmed);
        return {
            isBlocked: true,
            sanitizedText: '[FILTERED: Sensitive or off-platform payment details are not allowed.]',
            reasons: ['PHONE'],
            matchedTerms: [trimmed]
        };
    }

    const normalized = normalizeText(trimmed);

    const phoneMatches = trimmed.match(phoneRegex) || [];
    phoneMatches
        .map((value) => value.replace(/\D/g, ''))
        .filter((digits) => digits.length >= 10)
        .forEach((value) => reasonMap.PHONE.push(value));

    const emailMatches = trimmed.match(emailRegex) || [];
    emailMatches.forEach((value) => reasonMap.EMAIL.push(value));

    matchKeywords(normalized, bankKeywords, reasonMap.BANK_NAME);
    matchKeywords(normalized, walletKeywords, reasonMap.WALLET_NAME);
    matchKeywords(normalized, offPlatformKeywords, reasonMap.OFF_PLATFORM_REQUEST);

    const reasons = Object.keys(reasonMap).filter((key) => reasonMap[key].length > 0);
    const matchedTerms = reasons.flatMap((key) => reasonMap[key]);

    if (reasons.length === 0) {
        return {
            isBlocked: false,
            sanitizedText: trimmed,
            reasons: [],
            matchedTerms: []
        };
    }

    return {
        isBlocked: true,
        sanitizedText: '[FILTERED: Sensitive or off-platform payment details are not allowed.]',
        reasons,
        matchedTerms
    };
};

export const __private__ = {
    normalizeText,
    extractDigitsOnly
};
