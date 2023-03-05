/*
    Copyright 2021-2022 NXP.
    NXP Confidential. This software is owned or controlled by NXP and may only be used strictly in accordance with the applicable license terms.
    By expressly accepting such terms or by downloading, installing, activating and/or otherwise using the software,
    you are agreeing that you have read, and that you agree to comply with and are bound by, such license terms.
    If you do not agree to be bound by the applicable license terms, then you may not retain, install, activate or otherwise use the software.
*/

#import <Foundation/Foundation.h>
#import "MIFARELibraryManager.h"
#import "TL_Constants.h"
#include "IOSPrimitiveArray.h"
#import "TL_TagInfo.h"

NS_ASSUME_NONNULL_BEGIN

@interface TL_DESFireWrapper : NSObject

@property(nonatomic,strong) NSString *FAMILY_MIFARE;
@property(nonatomic,strong) NSString *TYPE_DESFIRE;
@property(nonatomic,strong) NSString *DESFIRE_EV1;
@property(nonatomic,strong) NSString *DESFIRE_EV2;
@property(nonatomic,strong) NSString *DESFIRE_EV3;
@property(nonatomic,strong) NSString *DESFIRE_EV3C;
@property(nonatomic,strong) NSString *DESFIRE_LIGHT;

@property(nonatomic,strong) NSArray *MAJOR_VERSION_DESFIRE_EV1;
@property(nonatomic,strong) NSArray *MAJOR_VERSION_DESFIRE_EV2;
@property(nonatomic,strong) NSArray *MAJOR_VERSION_DESFIRE_EV3;

@property(nonatomic,strong) NSDictionary *STORAGE_SIZE_DESFIRE;
@property(nonatomic,strong) NSDictionary *SUB_TYPE_DESFIRE;
@property(nonatomic,strong) NSDictionary *SUB_TYPE_DESFIRE_Light;

@property(nonatomic,strong) NSString *ZERO;
@property(nonatomic,strong) NSString *BYTES;

@property(nonatomic,strong) NSDictionary *PROTOCOL_LOOKUP;
@property(nonatomic,strong) NSString *PROTOCOL_04;

/**
 * Create Instance of DESFire with Library Manager
 *
 * @param libraryManager library manager for building custom modules
 * @return id
*/
-(id)initMIFAREWithLibraryManager:(MIFARELibraryManager *)libraryManager;

/**
 * GetVersion for detecting the card type
 *
 * @return response as TL_TagInfo
*/
-(TL_TagInfo *)getVersionForDetectingDesFireCardType;

/**
 * Set Command Set to determine the command (Native or ISO)
 *
 * @param cmdSet as ISO or Native from enum
*/
-(void)setCommandSet:(CommandSet)cmdSet;

@end

NS_ASSUME_NONNULL_END
