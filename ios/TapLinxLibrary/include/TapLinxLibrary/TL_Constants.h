/*
    Copyright 2021-2022 NXP.
    NXP Confidential. This software is owned or controlled by NXP and may only be used strictly in accordance with the applicable license terms.
    By expressly accepting such terms or by downloading, installing, activating and/or otherwise using the software,
    you are agreeing that you have read, and that you agree to comply with and are bound by, such license terms.
    If you do not agree to be bound by the applicable license terms, then you may not retain, install, activate or otherwise use the software.
*/

#ifndef TL_Constants_h
#define TL_Constants_h

/// Types of file available
typedef NS_ENUM(NSUInteger, FileType) {
    /// Standard Data file 0x00.
    DataStandard,
    /// Data back up file 0x01.
    DataBackup,
    /// Value file 0x02.
    Value,
    /// Linear Record file 0x03.
    RecordLinear,
    /// Cyclic Record file 0x04.
    RecordCyclic,
    /// Transaction Mac file 0x05.
    TransactionMac

};

/// Communication Types available
typedef NS_ENUM(NSUInteger, CommunicationType)
{
    /// Plain Comminication Type
    Plain,
    /// Mac Comminication Type
    MACed,
    /// Enciphered Comminication Type
    Enciphered,
};


/// Command Sets available
typedef NS_ENUM(NSUInteger, CommandSet)
{
    /// ISO Command Mode.
    ISO,
    /// Native Command Mode.
    Native
};

/// Supported authentication types
typedef NS_ENUM(NSUInteger, AuthType) {
    /// Native Authentication.
    AuthType_Native,
    /// ISO Authentication.
    AuthType_ISO,
    /// AES Authentication.
    AuthType_AES
};

/// Key Types Supported
typedef NS_ENUM(NSUInteger, KeyType) {
    /// THREEDES
    THREEDES,
    /// TWO_KEY_THREEDES
    TWO_KEY_THREEDES,
    /// THREE_KEY_THREEDES
    THREE_KEY_THREEDES,
    /// AES128
    AES128,
    /// UNKNOWN
    UNKNOWN
};

// Vendor
#define VENDOR_NXP_ID @"04"
#define VENDOR_NXP_NAME @"NXP Semiconductors"

// UI
#define HEX_PREFIX @"0x"

#define PUBLIC_KEY @"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9cj2YDOCqFVk6tx1BBMJUadss0/qZSCwvMjJaKWugstCHL0ZsumUhUyYw3e+76CjPzh4GVOddPOsuk7nQkwt5atQ82I0Z6ov+JGovYrbKVx/fAfWmxa8UfmgEl1J1Sd62z/2hzL5Enl2qFdIEnee0phtceZXSbf9JWsq+zJouVhR9JA9LmQUrgeWyl1TSJ3pWgNlnOW8nsfzUOUyjzJtEIn+SG9mmzM/JwDqL6F23js0qRLOOPA28gzsgozD6+nIh5+JAcw9upWHtkjM884hMeUmYmP7KIgHXOsACU+rerRmUljQNK6GrLZmZN9uyhlYlA/N+/kiWgBefzl9hvM0YwIDAQAB"

#define APP_NAME

#endif /// TL_Constants_h
