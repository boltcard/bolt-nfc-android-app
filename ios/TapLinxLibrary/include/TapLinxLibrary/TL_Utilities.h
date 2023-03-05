/*
    Copyright 2021-2022 NXP.
    NXP Confidential. This software is owned or controlled by NXP and may only be used strictly in accordance with the applicable license terms.
    By expressly accepting such terms or by downloading, installing, activating and/or otherwise using the software,
    you are agreeing that you have read, and that you agree to comply with and are bound by, such license terms.
    If you do not agree to be bound by the applicable license terms, then you may not retain, install, activate or otherwise use the software.
*/

#import <Foundation/Foundation.h>

@interface TL_Utilities : NSObject

/**
 * Create shared instance of TLUtilities
 *
 *
 * @return instance of TLUtilities
 */

+(TL_Utilities *)sharedUtility;

/**
 * convert data using int value and number of bytes
 *
 *
 * @param value it is a  int value to convert to NSData
 * @param noOfBytes contains the number of bytes to be converted
 * @return NSData value obtained from value and noOfBytes
 */
- (NSData *)intToNSDataWithValue:(int)value
                   withNoOfBytes:(int)noOfBytes;


/**
 * convert data to hex string
 *
 *
 * @param dataToConvert to Hex Represented String
 * @return NSString value obtained from value and noOfBytes
 */
- (NSString *)dataToHexString:(NSData *)dataToConvert;


@end
