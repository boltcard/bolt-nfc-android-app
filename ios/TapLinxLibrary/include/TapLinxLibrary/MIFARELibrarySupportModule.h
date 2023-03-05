/*
    Copyright 2021-2022 NXP.
    NXP Confidential. This software is owned or controlled by NXP and may only be used strictly in accordance with the applicable license terms.
    By expressly accepting such terms or by downloading, installing, activating and/or otherwise using the software,
    you are agreeing that you have read, and that you agree to comply with and are bound by, such license terms.
    If you do not agree to be bound by the applicable license terms, then you may not retain, install, activate or otherwise use the software.
*/

#import <Foundation/Foundation.h>

/* Enum representing the CardType
*/
enum CardType {
    DESFireEV1 = 0,
    DESFireEV2 = 1,
    Ultralight = 2,
    UltralightC = 3,
    UltralightEV1_11 = 4,
    UltralightEV1_21 = 5,
    NTag203X = 6,
    NTag210 = 7,
    NTag210u = 8,
    NTag213 = 9,
    NTag212 = 10,
    NTag215 = 11,
    NTag216 = 12,
    NTag213F = 13,
    NTag216F = 14,
    NTagI2C1K = 15,
    NTagI2C2K = 16,
    NTagI2CPlus1K = 17,
    NTagI2CPlus2K = 18,
    UnknownCard = 19,
    MIFAREClassic = 20,
    MIFAREClassicEV1 = 21,
    ICodeSLI = 22,
    ICodeSLIL = 23,
    ICodeSLIS = 24,
    ICodeSLIX = 25,
    ICodeSLIX2 = 26,
    ICodeSLIXL = 27,
    ICodeSLIXS = 28,
    ICodeDNA = 29,
    Enum_None = 30,
    PlusX = 31,
    PlusS = 32,
    PlusSL1 = 33,
};

@interface MIFARELibrarySupportModule : NSObject

/**
 * To get the utility which is being set in the LibraryManager
 *
 *
 * @return instance of MifareLibrarySupportModule
 */
- (instancetype)init;

/**
 * To get the crypto
 *
 *
 * id as crypto
 */
- (id)getCrypto;

/**
 * To get the instance logger
 *
 *
 * @return internal logger
 */
- (id)getInternalLogger;

/**
 * To get the logger
 *
 *
 * @return logger
 */
- (id)getLogger;

/**
 * To get the transceive
 *
 *
 * @return transceive
 */
- (id)getTransceive;

/**
 * To get the utility
 *
 *
 * @return utility
 */
+ (id)getUtility;

/**
 * Set crypto on the Support Module
 *
 *
 * @param crypto for cryptographic operation
 */
- (void)setCryptoWithComNxpNfclibSysinterfacesICrypto:(id)crypto;

/**
 * Set transceive on the Support Module
 *
 *
 * @param transceive for communication
 */
- (void)setTransceiveWithComNxpNfclibSysinterfacesIApduHandler:(id)transceive;

/**
 * It is a instance method to set utility on the Support Module
 *
 *
 * @param utility for iutility
 */
+ (void)setUtilityWithComNxpNfclibSysinterfacesIUtility:(id)utility;


@end
