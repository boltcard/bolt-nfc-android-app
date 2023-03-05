//
//  RCTMyReactModule.m
//  lightningnfcapp
//
//  Created by Hyojae Jung on 10/01/23.
//

#import "RCTMyReactModule.h"
#import <React/RCTLog.h>

@implementation RCTMyReactModule

NSString* const CARD_MODE_READ = @"read";
NSString* const CARD_MODE_WRITE = @"write";
NSString* const CARD_MODE_WRITEKEYS = @"writekeys";
NSString* const CARD_MODE_RESETKEYS = @"resetkeys";
NSString* const CARD_MODE_CREATEBOLTCARD = @"createBoltcard";

NSString* cardmode = CARD_MODE_READ;

//- (void) initializeLibrary
//{
//  
//}
//
//- (void) initializeKeys
//{
////  tapLinxLibrary.verifyLicense() { isSuccess in
////    if(isSuccess) {
////      //success
////      self.fireLocalNotification(notificationString: "License Verified Successfully")
////    } else {
////      //failed
////      self.fireLocalNotification(notificationString: "License Verified Failed");
////    }
////
////  }
//  
//}

RCT_EXPORT_METHOD(setCardMode:(NSString *)pCardmode)
{
  if(pCardmode != nil)
  {
    cardmode = pCardmode;
    RCTLogInfo(@"Pretending to set cardmode %@: %@", pCardmode, cardmode);
  } else {
    RCTLogInfo(@"*** setCardMode called with null string");
  }
}

// To export a module named RCTMyReactModule
RCT_EXPORT_MODULE();

@end
