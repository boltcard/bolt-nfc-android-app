//
//  RCTMyReactModule.h
//  lightningnfcapp
//
//  Created by Hyojae Jung on 10/01/23.
//

#import <React/RCTBridgeModule.h>
@interface RCTMyReactModule : NSObject <RCTBridgeModule>

extern NSString* const CARD_MODE_READ;
extern NSString* const CARD_MODE_WRITE;
extern NSString* const CARD_MODE_WRITEKEYS;
extern NSString* const CARD_MODE_RESETKEYS;
extern NSString* const CARD_MODE_CREATEBOLTCARD;

//-(void)initializeLibrary;
//-(void)initializeKeys;

@end
