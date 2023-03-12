/*
    Copyright 2022 NXP.
    NXP Confidential. This software is owned or controlled by NXP and may only be used strictly in accordance with the applicable license terms.
    By expressly accepting such terms or by downloading, installing, activating and/or otherwise using the software,
    you are agreeing that you have read, and that you agree to comply with and are bound by, such license terms.
    If you do not agree to be bound by the applicable license terms, then you may not retain, install, activate or otherwise use the software.
*/

#import <Foundation/Foundation.h>
#import <SystemConfiguration/SystemConfiguration.h>

NS_ASSUME_NONNULL_BEGIN

@interface TapLinxLibrary : NSObject

/**
 * Create instance of TapLinxLibrary
 *
 *
 * @return instance of TapLinxLibrary
 */
+(TapLinxLibrary *)sharedLibrary;

/**
 * Fetch bundle identifier of the app
 *
 * @return NSString value obtained from the bundle
 */
-(NSString *) bundleIdentifierOftheApp;

/**
 * Verify the license generated by the user of Mifare Portal
 *
 *  @param licenseKey to  verify
 */
-(void)verifyLicense:(NSString *) licenseKey  WithCompletionHandler : (void (^) (BOOL isSuccess)) completionHandler;


/// Perform local verification of License using Key
/// @param signature for offline license verification
-(BOOL)doLocalVerificationWithSignature:(NSData *)signature;


@end

NS_ASSUME_NONNULL_END
