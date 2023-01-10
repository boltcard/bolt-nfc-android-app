/*
    Copyright 2021-2022 NXP.
    NXP Confidential. This software is owned or controlled by NXP and may only be used strictly in accordance with the applicable license terms.
    By expressly accepting such terms or by downloading, installing, activating and/or otherwise using the software,
    you are agreeing that you have read, and that you agree to comply with and are bound by, such license terms.
    If you do not agree to be bound by the applicable license terms, then you may not retain, install, activate or otherwise use the software.
*/


#import <Foundation/Foundation.h>
#import <CommonCrypto/CommonCryptor.h>

@interface MiFareCryptoHelper : NSObject

/**
 * Do DES Cipher operation
 *
 *
 * @param plainText as NSData to encrypt
 * @param symmetricKey as NSData to be used for cipher operation
 * @param encryptOrDecrypt as CCOperation to determine to encrypt or decrypt
 * @param option as CCOptions
 * @param iv as NSData to depict initial value
 * @return NSData either plain text or encrypted text
 */
- (NSData *)doDESCipher:(NSData *)plainText key:(NSData *)symmetricKey context:(CCOperation)encryptOrDecrypt option:(CCOptions *)option initialV:(NSData *)iv ;

/**
 * Do AES Cipher operation
 *
 *
 * @param plainText as NSData to encrypt
 * @param symmetricKey as NSData to be used for cipher operation
 * @param encryptOrDecrypt as CCOperation to determine to encrypt or decrypt
 * @param option as CCOptions
 * @param iv as NSData to depict initial value
 * @return NSData either plain text or encrypted text
 */
- (NSData *)doAESCipher:(NSData *)plainText key:(NSData *)symmetricKey context:(CCOperation)encryptOrDecrypt option:(CCOptions *)option initialV:(NSData *)iv;


@end
