//
//  RCTMyReactModule.m
//  lightningnfcapp
//
//  Created by Hyojae Jung on 10/01/23.
//

#import "RCTMyReactModule.h"
#import <React/RCTLog.h>

@implementation RCTMyReactModule

RCT_EXPORT_METHOD(setCardMode:(NSString *)cardmode)
{
  if(cardmode != nil)
  {
    RCTLogInfo(@"Pretending to set cardmode %@", cardmode);
  } else {
    RCTLogInfo(@"*** setCardMode called with null string");
  }
}

// To export a module named RCTMyReactModule
RCT_EXPORT_MODULE();

@end
