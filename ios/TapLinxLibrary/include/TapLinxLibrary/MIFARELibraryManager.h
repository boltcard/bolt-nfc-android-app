/*
    Copyright 2021-2022 NXP.
    NXP Confidential. This software is owned or controlled by NXP and may only be used strictly in accordance with the applicable license terms.
    By expressly accepting such terms or by downloading, installing, activating and/or otherwise using the software,
    you are agreeing that you have read, and that you agree to comply with and are bound by, such license terms.
    If you do not agree to be bound by the applicable license terms, then you may not retain, install, activate or otherwise use the software.
*/

#import <Foundation/Foundation.h>
#import "MIFARELibrarySupportModule.h"

@interface MIFARELibraryManager : NSObject

/**
 * Create instance of MIFARELibraryManager
 *
 *
 * @return instance of MIFARELibraryManager
 */
- (instancetype)init;

/**
 * Init MIFARELibraryManager
 *
 *
 * @param customModules as id
 * @return instance of MIFARELibraryManager
 */
- (instancetype)initWithCustomModules:(id)customModules;

/**
 * Init MIFARELibraryManager
 *
 *
 * @return instance of MIFARELibraryManager
 */
- (id)getSupportModules;

/**
 * To get the utility which is being set in the LibraryManager
 *
 *
 * @return utility
 */
- (id)getUtility;

/**
 * Init MIFARELibraryManager
 *
 *
 * @param apduHandler to set the apduhandler in CoreTapLinxLibrary
 */
- (void)setApduHandlerWithApduHandler:(id)apduHandler;

@end
