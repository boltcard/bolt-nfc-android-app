/*
    Copyright 2021-2022 NXP.
    NXP Confidential. This software is owned or controlled by NXP and may only be used strictly in accordance with the applicable license terms.
    By expressly accepting such terms or by downloading, installing, activating and/or otherwise using the software,
    you are agreeing that you have read, and that you agree to comply with and are bound by, such license terms.
    If you do not agree to be bound by the applicable license terms, then you may not retain, install, activate or otherwise use the software.
*/

#import <Foundation/Foundation.h>
#import "TL_Constants.h"
#import "IOSPrimitiveArray.h"

NS_ASSUME_NONNULL_BEGIN

/// CreateAppSettingsModel
@interface CreateAppSettingsModel : NSObject

/// True if master key interchangeable, false if not
@property (nonatomic) BOOL masterKeyInterchangable;

/// True authentication required for file management, false if not
@property (nonatomic) BOOL authRequiredForFileManagement;

/// True authentication required for file configuration, false if not
@property (nonatomic) BOOL authRequiredForFileConfiguration;

/// True ISO File ID is present, false if not
@property (nonatomic) BOOL isoFileIDPresent;

/// True if app key setting are changeable, false if not
@property (nonatomic) BOOL appKeySettingChangable;

///  Type of the key to be used
@property (nonatomic) enum KeyType keyType;

/// Access rights  to be used
@property (nonatomic) jbyte changeAccessRights;

/// Max number of application  to be used
@property (nonatomic) int maxNumberOfApplication;

/// Number of key sets to be used
@property (nonatomic) int numberOfKeySets;

/// Key set version to be used
@property (nonatomic) int activeKeySetVersion;

///  Max key size  to be used
@property (nonatomic) int maxKeySize;

/// Inittialize CreateAppSettingsModel
/// @param numberOfKeySets number of key sets to be used
/// @param maxNumberOfApplication max number of application  to be used
/// @param maxKeySize max key size  to be used
/// @param activeKeySetVersion Key set version to be used
/// @param keyType  key type to be used
/// @param changeAccessRights access rights  to be used
/// @param masterKeyInterchangable true if master key interchangable, false if not
/// @param authRequiredForFileManagement true authentication required for file management, false if not
/// @param authRequiredForFileConfiguration true authentication required for file configuration, false if not
/// @param isoFileIDPresent true ISO File ID is present, false if not
/// @param appKeySettingChangable true if app key setting are changable, false if not
-(id)initWithNumberOfKeySets: (int)numberOfKeySets
                 andMaxNoApp: (int)maxNumberOfApplication
               andMaxKeySize: (int)maxKeySize
      andActiveKeySetVersion: (int)activeKeySetVersion
                  andKeyType: (enum KeyType)keyType
             andAccessRights: (jbyte)changeAccessRights
  andMasterKeyInterChangable: (BOOL)masterKeyInterchangable
andAuthRequiredForFileManagement: (BOOL)authRequiredForFileManagement
andAuthRequiredForFileConfiguration: (BOOL)authRequiredForFileConfiguration
         andisoFileIDPresent: (BOOL)isoFileIDPresent
   andAppKeySettingChangable: (BOOL)appKeySettingChangable;

@end

NS_ASSUME_NONNULL_END
