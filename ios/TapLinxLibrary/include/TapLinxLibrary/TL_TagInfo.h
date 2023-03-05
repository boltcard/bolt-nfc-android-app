/*
    Copyright 2021-2022 NXP.
    NXP Confidential. This software is owned or controlled by NXP and may only be used strictly in accordance with the applicable license terms.
    By expressly accepting such terms or by downloading, installing, activating and/or otherwise using the software,
    you are agreeing that you have read, and that you agree to comply with and are bound by, such license terms.
    If you do not agree to be bound by the applicable license terms, then you may not retain, install, activate or otherwise use the software.
*/

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface TL_TagInfo : NSObject

@property (strong, nonatomic) NSString *uid;
@property (strong, nonatomic) NSString *family;
@property (strong, nonatomic) NSString *vendor;
@property (strong, nonatomic) NSString *type;
@property (strong, nonatomic) NSString *subType;
@property (strong, nonatomic) NSString *productName;
@property (strong, nonatomic) NSString *storageSize;
@property (strong, nonatomic) NSString *tagProtocol;
@property (strong, nonatomic) NSString *historicalBytes;
@property (strong, nonatomic) NSString *majorVersion;
@property (strong, nonatomic) NSString *minorVersion;

@end

NS_ASSUME_NONNULL_END
