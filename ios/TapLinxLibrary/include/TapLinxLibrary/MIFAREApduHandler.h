/*
    Copyright 2021-2022 NXP.
    NXP Confidential. This software is owned or controlled by NXP and may only be used strictly in accordance with the applicable license terms.
    By expressly accepting such terms or by downloading, installing, activating and/or otherwise using the software,
    you are agreeing that you have read, and that you agree to comply with and are bound by, such license terms.
    If you do not agree to be bound by the applicable license terms, then you may not retain, install, activate or otherwise use the software.
*/

#import <Foundation/Foundation.h>

@protocol MIFAREApduHandlerProtocol < NSObject >

/**
 * APDU exchange delegate method with NFC and CoreTapLinx
 *
 *
 * @param apduData command bytes to be sent to the NFC
 * @return NSData response received from the NFC communication
 */
- (NSData *)apduExchangeWithByteArray:(NSData *)apduData;

@end

@interface MIFAREApduHandler : NSObject

/// delegate property for MIFAREApduHandlerProtocol
@property (nonatomic, assign) id <MIFAREApduHandlerProtocol> delegate;

@end
