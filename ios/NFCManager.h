#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#elif __has_include("React/RCTBridgeModule.h")
#import "React/RCTBridgeModule.h"
#else
#import "RCTBridgeModule.h"
#import <React/RCTEventEmitter.h>
#endif
#import <CoreNFC/CoreNFC.h>

#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && (__IPHONE_OS_VERSION_MAX_ALLOWED >= 12000) /* __IPHONE_12_0 */
#import <UIKit/UIUserActivity.h>
#endif
#import "MIFAREApduHandler.h"
#import "MIFARELibraryManager.h"
#import "TL_DESFireEV2.h"
#import "TL_DESFireWrapper.h"

@interface NfcManager : RCTEventEmitter <RCTBridgeModule, NFCNDEFReaderSessionDelegate, NFCTagReaderSessionDelegate, MIFAREApduHandlerProtocol> {
  
}

@property (strong, nonatomic) NFCNDEFReaderSession * _Nullable session;
@property (strong, nonatomic) NFCTagReaderSession * _Nullable tagSession;
@property (strong, nonatomic) MIFARELibraryManager * _Nullable libraryManager;
@property (strong, nonatomic) MIFAREApduHandler * _Nullable apduHandler;
@property (strong, nonatomic) TL_DESFireEV2 * _Nullable desFireEV2;
@property (strong, nonatomic) TL_DESFireWrapper * _Nullable desFireWrapper;

+ (BOOL)application:(nonnull UIApplication *)application
continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:
#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && (__IPHONE_OS_VERSION_MAX_ALLOWED >= 12000) /* __IPHONE_12_0 */
(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> *_Nullable))restorationHandler;
#else
(nonnull void (^)(NSArray *_Nullable))restorationHandler;
#endif

@end

extern NSString* _Nonnull getHexString(NSData * _Nonnull);
extern NSString* _Nonnull getErrorMessage(NSError * _Nonnull);
extern NSData * _Nonnull arrayToData(NSArray * _Nonnull);
extern NSArray * _Nonnull dataToArray(NSData * _Nonnull);
