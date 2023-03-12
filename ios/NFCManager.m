#import "NfcManager.h"
#import "React/RCTBridge.h"
#import "React/RCTConvert.h"
#import "React/RCTEventDispatcher.h"
#import "React/RCTLog.h"
#import "TapLinxLibrary.h"

@implementation NfcManager {
    NSDictionary *nfcTechTypes;
    NSArray *techRequestTypes;
    RCTResponseSenderBlock techRequestCallback;
}

RCT_EXPORT_MODULE(MyReactModule)

@synthesize session;
@synthesize tagSession;

static NSString *const kBgNfcTagNotification = @"RNBgNfcTagNotification";
NSArray * bgNdefRecords = nil;

+ (BOOL)application:(UIApplication *)application
continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:
#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && (__IPHONE_OS_VERSION_MAX_ALLOWED >= 12000) /* __IPHONE_12_0 */
(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> *_Nullable))restorationHandler {
#else
    (nonnull void (^)(NSArray *_Nullable))restorationHandler {
#endif
    if ([userActivity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb]) {
        if (@available(iOS 12.0, *)) {
            NFCNDEFMessage * ndefMessage = userActivity.ndefMessagePayload;
            if (ndefMessage != nil) {
                bgNdefRecords = [NfcManager convertNdefMessage: ndefMessage];
                [[NSNotificationCenter defaultCenter] postNotificationName:kBgNfcTagNotification
                                                                    object:self
                                                                  userInfo:nil];
            }
        }
    }
    return YES;
}
    
- (void)handleBgNfcTagNotification:(NSNotification *)notification
{
    [self sendEventWithName:@"NfcManagerDiscoverBackgroundTag"
                       body:@{@"ndefMessage": bgNdefRecords}];
}
    
- (instancetype)init
{
    if (self = [super init]) {
        NSLog(@"NfcManager created");
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(handleBgNfcTagNotification:)
                                                     name:kBgNfcTagNotification
                                                   object:nil];
    }
    
    if (@available(iOS 13.0, *)) {
        nfcTechTypes = @{
            [NSNumber numberWithInt: NFCTagTypeMiFare]: @"mifare",
            [NSNumber numberWithInt: NFCTagTypeFeliCa]: @"felica",
            [NSNumber numberWithInt: NFCTagTypeISO15693]: @"iso15693",
            // compatible with Android
            [NSNumber numberWithInt: NFCTagTypeISO7816Compatible]: @"IsoDep",
        };
    } else {
        nfcTechTypes = nil;
    }
    
    return self;
}

- (void)reset
{
    session = nil;
    tagSession = nil;
    techRequestTypes = nil;
    techRequestCallback = nil;
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[
             @"NfcManagerDiscoverTag",
             @"NfcManagerDiscoverBackgroundTag",
             @"NfcManagerSessionClosed",
             @"CreateBoltCard",
             @"NFCError"
             ];
}

+ (NSDictionary*)convertNdefRecord:(NFCNDEFPayload *) record
{
    return @{
             @"id": dataToArray([record identifier]),
             @"payload": dataToArray([record payload]),
             @"type": dataToArray([record type]),
             @"tnf": [NSNumber numberWithInt:[record typeNameFormat]]
             };
}

+ (NSArray*)convertNdefMessage:(NFCNDEFMessage *)message
{
    NSArray * records = [message records];
    NSMutableArray *resultArray = [NSMutableArray arrayWithCapacity: [records count]];
    for (int i = 0; i < [records count]; i++) {
        [resultArray addObject:[self convertNdefRecord: records[i]]];
    }
    return resultArray;
}

- (NSString*)getRNTechName:(id<NFCTag>)tag {
    NSString * tech = [nfcTechTypes objectForKey:[NSNumber numberWithInt:(int)tag.type]];
    if (tech == nil) {
        tech = @"unknown";
    }
    return tech;
}

- (NSDictionary*)getRNTag:(id<NFCTag>)tag {
    NSMutableDictionary *tagInfo = @{}.mutableCopy;
    NSString* tech = [self getRNTechName:tag];
    [tagInfo setObject:tech forKey:@"tech"];
                   
    if (@available(iOS 13.0, *)) {
        if (tag.type == NFCTagTypeMiFare) {
            id<NFCMiFareTag> mifareTag = [tag asNFCMiFareTag];
            [tagInfo setObject:getHexString(mifareTag.identifier) forKey:@"id"];
        } else if (tag.type == NFCTagTypeISO7816Compatible) {
            id<NFCISO7816Tag> iso7816Tag = [tag asNFCISO7816Tag];
            [tagInfo setObject:getHexString(iso7816Tag.identifier) forKey:@"id"];
            [tagInfo setObject:iso7816Tag.initialSelectedAID forKey:@"initialSelectedAID"];
            [tagInfo setObject:dataToArray(iso7816Tag.historicalBytes) forKey:@"historicalBytes"];
            [tagInfo setObject:dataToArray(iso7816Tag.applicationData) forKey:@"applicationData"];
        } else if (tag.type == NFCTagTypeISO15693) {
            id<NFCISO15693Tag> iso15693Tag = [tag asNFCISO15693Tag];
            [tagInfo setObject:getHexString(iso15693Tag.identifier) forKey:@"id"];
            [tagInfo setObject:[NSNumber numberWithUnsignedInteger:iso15693Tag.icManufacturerCode] forKey:@"icManufacturerCode"];
            [tagInfo setObject:dataToArray(iso15693Tag.icSerialNumber) forKey:@"icSerialNumber"];
        } else if (tag.type == NFCTagTypeFeliCa) {
            id<NFCFeliCaTag> felicaTag = [tag asNFCFeliCaTag];
            [tagInfo setObject:getHexString(felicaTag.currentIDm) forKey:@"idm"];
            [tagInfo setObject:getHexString(felicaTag.currentSystemCode) forKey:@"systemCode"];
        }
    }

    return tagInfo;
}

- (id<NFCNDEFTag>)getNDEFTagHandle:(id<NFCTag>)tag
    API_AVAILABLE(ios(13.0)) {
    // all following types inherite from NFCNDEFTag
    if (tag.type == NFCTagTypeMiFare) {
        return [tag asNFCMiFareTag];
    } else if (tag.type == NFCTagTypeISO7816Compatible) {
        return [tag asNFCISO7816Tag];
    } else if (tag.type == NFCTagTypeISO15693) {
        return [tag asNFCISO15693Tag];
    } else if (tag.type == NFCTagTypeFeliCa) {
        return [tag asNFCFeliCaTag];
    }

    return nil;
}

- (void)readerSession:(NFCNDEFReaderSession *)session didDetectNDEFs:(NSArray<NFCNDEFMessage *> *)messages
{
    NSLog(@"readerSession:didDetectNDEFs");
    if ([messages count] > 0) {
        // parse the first message for now
        [self sendEventWithName:@"NfcManagerDiscoverTag"
                           body:@{@"ndefMessage": [NfcManager convertNdefMessage:messages[0]]}];
    } else {
        [self sendEventWithName:@"NfcManagerDiscoverTag"
                           body:@{@"ndefMessage": @[]}];
    }
}

- (void)readerSession:(NFCNDEFReaderSession *)session didInvalidateWithError:(NSError *)error
{
    NSLog(@"readerSession:didInvalidateWithError: (%@)", [error localizedDescription]);
    [self reset];
    [self sendEventWithName:@"NfcManagerSessionClosed"
                       body:@{@"error": getErrorMessage(error)}];
}

- (void)tagReaderSession:(NFCTagReaderSession *)session didDetectTags:(NSArray<__kindof id<NFCTag>> *)tags
    API_AVAILABLE(ios(13.0)) {
    NSLog(@"NFCTag didDetectTags");
    if (techRequestCallback != nil) {
        for (id<NFCTag> tag in tags) {
            NSString * tagType = [self getRNTechName:tag];
            
            for (NSString* requestType in techRequestTypes) {
                // here we treat Ndef is a special case, because all specific tech types
                // inherites from NFCNDEFTag, so we simply allow it to connect
                if ([tagType isEqualToString:requestType] || [requestType isEqualToString:@"Ndef"]) {
                    RCTResponseSenderBlock pendingCallback = techRequestCallback;
                    techRequestCallback = nil;

                    [tagSession connectToTag:tag
                           completionHandler:^(NSError *error) {
                        if (error != nil) {
                            pendingCallback(@[getErrorMessage(error)]);
                            return;
                        }
                        
                        pendingCallback(@[[NSNull null], requestType]);
                    }];
                    return;
                }
            }
        }
    }
}

- (void)tagReaderSession:(NFCTagReaderSession *)session didInvalidateWithError:(NSError *)error
    API_AVAILABLE(ios(13.0)) {
    NSLog(@"NFCTag didInvalidateWithError");
    if (techRequestCallback) {
        techRequestCallback(@[getErrorMessage(error)]);
        techRequestCallback = nil;
    }

    [self reset];
    [self sendEventWithName:@"NfcManagerSessionClosed"
                       body:@{@"error": getErrorMessage(error)}];
}

- (void)tagReaderSessionDidBecomeActive:(NFCTagReaderSession *)session
    API_AVAILABLE(ios(13.0)) {
    NSLog(@"NFCTag didBecomeActive");
}
  
- (NSData *)apduExchangeWithByteArray:(NSData *)apduData {
  NSMutableData *dataToReturn = [[NSMutableData alloc] init];
  dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);

  id<NFCTag> tag = nil;
  
  if (tagSession != nil) {
      if (tagSession.connectedTag) {
          tag = tagSession.connectedTag;
          switch (tag.type) {
              case NFCTagTypeMiFare: {
                  id<NFCMiFareTag> miFareTag = [tag asNFCMiFareTag];
                  [miFareTag sendMiFareCommand:apduData completionHandler:^(NSData * _Nullable responseData, NSError * _Nullable error) {            if (responseData) {                [dataToReturn setData:responseData];
                      }
                      dispatch_semaphore_signal(semaphore);
                  }];
                  break;
              }
            case NFCTagTypeISO15693: {
                  id<NFCISO7816Tag> iso7816Tag = [tag asNFCISO7816Tag];
                  NFCISO7816APDU *apdu = [[NFCISO7816APDU alloc] initWithData:apduData];
                  [iso7816Tag sendCommandAPDU:apdu completionHandler:^(NSData * _Nullable responseData, uint8_t sw1, uint8_t sw2, NSError * _Nullable error) {            if (responseData) {                [dataToReturn setData:responseData];
                      }
                      [dataToReturn appendBytes:&sw1 length:1];
                      [dataToReturn appendBytes:&sw2 length:1];
                      dispatch_semaphore_signal(semaphore);
                  }];
                  break;
              }
              default:
                  break;
          }
      }
  } else {
    NSLog(@"apduExchangeWithByteArray no session avail");
  }
  
  

  dispatch_semaphore_wait(semaphore, dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3.0 * NSEC_PER_SEC)));

  return dataToReturn;
  
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

RCT_EXPORT_METHOD(initializeLib)
{
    RCTLogInfo(@"Verifing license");
    TapLinxLibrary *taplinxLibrary = [TapLinxLibrary sharedLibrary];

    //online license verification is not working atm
    //  [taplinxLibrary verifyLicense:@"87f293036c2e5cd0092055f45da295ed" WithCompletionHandler:^(BOOL isSuccess) {
    //      if (isSuccess) {
    //          // success
    //          RCTLogInfo(@"Verifing license success");
    //      } else {
    //          // failed
    //          RCTLogInfo(@"Verifing license failed");
    //      }
    //  }];

    NSString *key = @"IdHhqzL1Eyn/Q+iM7Al2ZMiMDr/atXGN6LI9Q3viETm0SWwdLYs8WHZZtUPRDeiAs59ae673SUlQoExOBOezsk5r9wcpSfp+dqRKAFqfeB2ck/ExVTabaRlWJ/MjprIzkFPMa6qwXidxFpoSm3yrWs3elanBCeyTUkDkoR0QjhheF8Y5Oi+fZ3dJVu53/eVy2LL0QbfOzzaY3CQsYxWa0/EHWLMMq7MpYJicKzUAwcJYi4YI/xVN4ATXeeGkimtgo9BTFWiP+wY8B1aq+3i4J51FkyLjCCFrWCESNClGKpfomICVHUbiJfxcXp8tm5UeiZXQTGag0SSMui03/frU2w==";
    NSData *decodedSignature = [[NSData alloc] initWithBase64EncodedString:key options:NSDataBase64DecodingIgnoreUnknownCharacters];

    if (decodedSignature == nil) {
        NSLog(@"Failed to decode signature");
        return;
    }

    BOOL verified = [taplinxLibrary doLocalVerificationWithSignature:decodedSignature];

    //@TODO: send RN a message
    if (verified) {
        // Code for verification success
        NSLog(@"Offline verification success");
    } else {
        // Code for verification failure
        NSLog(@"Offline verification failed");
    }
}
    
RCT_EXPORT_METHOD(getBackgroundNdef: (nonnull RCTResponseSenderBlock)callback)
{
    if (bgNdefRecords != nil) {
        callback(@[[NSNull null], bgNdefRecords]);
    } else {
        callback(@[[NSNull null], [NSNull null]]);
    }
}

RCT_EXPORT_METHOD(clearBackgroundNdef: (nonnull RCTResponseSenderBlock)callback)
{
    bgNdefRecords = nil;
    callback(@[[NSNull null]]);
}

RCT_EXPORT_METHOD(isSupported: (NSString *)tech callback:(nonnull RCTResponseSenderBlock)callback)
{
    if ([tech isEqualToString:@""] || [tech isEqualToString:@"Ndef"]) {
        if (@available(iOS 11.0, *)) {
            callback(@[[NSNull null], NFCNDEFReaderSession.readingAvailable ? @YES : @NO]);
            return;
        }
    } else if ([tech isEqualToString:@"mifare"] || [tech isEqualToString:@"felica"] || [tech isEqualToString:@"iso15693"] || [tech isEqualToString:@"IsoDep"]) {
        if (@available(iOS 13.0, *)) {
            callback(@[[NSNull null], NFCTagReaderSession.readingAvailable ? @YES : @NO]);
            return;
        }
    }

    callback(@[[NSNull null], @NO]);
}

RCT_EXPORT_METHOD(start: (nonnull RCTResponseSenderBlock)callback)
{
    if (@available(iOS 11.0, *)) {
        if (NFCNDEFReaderSession.readingAvailable) {
            NSLog(@"NfcManager initialized");
            [self reset];
            callback(@[]);
            return;
        }
    }

    callback(@[@"Not support in this device", [NSNull null]]);
}

RCT_EXPORT_METHOD(requestTechnology: (NSArray *)techs options: (NSDictionary *)options callback:(nonnull RCTResponseSenderBlock)callback)
{
    if (@available(iOS 13.0, *)) {
        if (tagSession == nil && session == nil) {
            NFCPollingOption pollFlags = NFCPollingISO14443 | NFCPollingISO15693;
            if ([techs containsObject:@"felica"]) {
                pollFlags |= NFCPollingISO18092;
            }
            tagSession = [[NFCTagReaderSession alloc]
                          initWithPollingOption:pollFlags delegate:self queue:dispatch_get_main_queue()];
//            tagSession.alertMessage = [options objectForKey:@"alertMessage"];
            [tagSession beginSession];
            techRequestTypes = techs;
            techRequestCallback = callback;
        } else {
            callback(@[@"Duplicated registration", [NSNull null]]);
        }
    } else {
        callback(@[@"Not support in this device", [NSNull null]]);
    }
}

RCT_EXPORT_METHOD(cancelTechnologyRequest:(nonnull RCTResponseSenderBlock)callback)
{
    if (@available(iOS 13.0, *)) {
        if (tagSession != nil) {
            [tagSession invalidateSession];
            callback(@[]);
        } else {
            callback(@[@"Not even registered", [NSNull null]]);
        }
    } else {
        callback(@[@"Not support in this device", [NSNull null]]);
    }
}

RCT_EXPORT_METHOD(registerTagEvent:(NSDictionary *)options callback:(nonnull RCTResponseSenderBlock)callback)
{
    if (@available(iOS 11.0, *)) {
        if (session == nil && tagSession == nil) {
            session = [[NFCNDEFReaderSession alloc]
                       initWithDelegate:self queue:dispatch_get_main_queue() invalidateAfterFirstRead:[[options objectForKey:@"invalidateAfterFirstRead"] boolValue]];
            session.alertMessage = [options objectForKey:@"alertMessage"];
            [session beginSession];
            callback(@[]);
        } else {
            callback(@[@"Duplicated registration", [NSNull null]]);
        }
    } else {
        callback(@[@"Not support in this device", [NSNull null]]);
    }
}

RCT_EXPORT_METHOD(unregisterTagEvent:(nonnull RCTResponseSenderBlock)callback)
{
    if (@available(iOS 11.0, *)) {
        if (session != nil) {
            [session invalidateSession];
            callback(@[]);
        } else {
            callback(@[@"Not even registered", [NSNull null]]);
        }
    } else {
        callback(@[@"Not support in this device", [NSNull null]]);
    }
}

RCT_EXPORT_METHOD(invalidateSession:(nonnull RCTResponseSenderBlock)callback)
{
    if (@available(iOS 13.0, *)) {
        if (session != nil) {
            [session invalidateSession];
            callback(@[]);
        } else if (tagSession != nil) {
            [tagSession invalidateSession];
            callback(@[]);
        } else {
            callback(@[@"No active session", [NSNull null]]);
        }
    }
}

RCT_EXPORT_METHOD(invalidateSessionWithError:(NSString *)errorMessage callback:(nonnull RCTResponseSenderBlock)callback)
{
    if (@available(iOS 13.0, *)) {
        if (session != nil) {
            [session invalidateSessionWithErrorMessage: errorMessage];
            callback(@[]);
        } else if (tagSession != nil) {
            [tagSession invalidateSessionWithErrorMessage: errorMessage];
            callback(@[]);
        } else {
            callback(@[@"No active session", [NSNull null]]);
        }
    }
}

RCT_EXPORT_METHOD(getTag: (nonnull RCTResponseSenderBlock)callback)
{
    if (@available(iOS 13.0, *)) {
        NSMutableDictionary* rnTag = @{}.mutableCopy;
        id<NFCNDEFTag> ndefTag = nil;
        
        if (tagSession != nil) {
            if (tagSession.connectedTag) {
                rnTag = [self getRNTag:tagSession.connectedTag].mutableCopy;
                ndefTag = [self getNDEFTagHandle:tagSession.connectedTag];
            }
        } else {
            callback(@[@"No session available", [NSNull null]]);
        }
        
        if (ndefTag) {
            [ndefTag readNDEFWithCompletionHandler:^(NFCNDEFMessage *ndefMessage, NSError *error) {
                if (!error) {
                    [rnTag setObject:[NfcManager convertNdefMessage:ndefMessage] forKey:@"ndefMessage"];
                }
                callback(@[[NSNull null], rnTag]);
            }];
            return;
        }
        
        callback(@[[NSNull null], rnTag]);
    } else {
        callback(@[@"Not support in this device", [NSNull null]]);
    }
}

RCT_EXPORT_METHOD(getNdefMessage: (nonnull RCTResponseSenderBlock)callback)
{
    if (@available(iOS 13.0, *)) {
        id<NFCNDEFTag> ndefTag = nil;
        
        if (tagSession != nil) {
            if (tagSession.connectedTag) {
                ndefTag = [self getNDEFTagHandle:tagSession.connectedTag];
            }
        }
        
        if (ndefTag) {
            [ndefTag readNDEFWithCompletionHandler:^(NFCNDEFMessage *ndefMessage, NSError *error) {
                if (error) {
                    callback(@[getErrorMessage(error), [NSNull null]]);
                } else {
                    callback(@[[NSNull null], @{@"ndefMessage": [NfcManager convertNdefMessage:ndefMessage]}]);
                }
            }];
            return;
        }
        
        callback(@[@"No ndef available", [NSNull null]]);
    } else {
        callback(@[@"Not support in this device", [NSNull null]]);
    }
}

RCT_EXPORT_METHOD(writeNdefMessage:(NSArray*)bytes callback:(nonnull RCTResponseSenderBlock)callback)
{
    if (@available(iOS 13.0, *)) {
        id<NFCNDEFTag> ndefTag = nil;
        
        if (tagSession != nil) {
            if (tagSession.connectedTag) {
                ndefTag = [self getNDEFTagHandle:tagSession.connectedTag];
            }
        }
        
        if (ndefTag) {
            NSData *data = arrayToData(bytes);
            NFCNDEFMessage *ndefMsg = [NFCNDEFMessage ndefMessageWithData:data];
            if (!ndefMsg) {
                callback(@[@"invalid ndef msg"]);
                return;
            }

            [ndefTag writeNDEF:ndefMsg completionHandler:^(NSError *error) {
                if (error) {
                    callback(@[getErrorMessage(error), [NSNull null]]);
                } else {
                    callback(@[[NSNull null]]);
                }
            }];
            return;
        }
        
        callback(@[@"No ndef available", [NSNull null]]);
    } else {
        callback(@[@"Not support in this device", [NSNull null]]);
    }
}

RCT_EXPORT_METHOD(makeReadOnly:(nonnull RCTResponseSenderBlock)callback)
{
    if (@available(iOS 13.0, *)) {
        id<NFCNDEFTag> ndefTag = nil;
        
        if (tagSession != nil) {
            if (tagSession.connectedTag) {
                ndefTag = [self getNDEFTagHandle:tagSession.connectedTag];
            }
        }
        
        if (ndefTag) {
            [ndefTag writeLockWithCompletionHandler:^(NSError *error) {
                if (error) {
                    callback(@[getErrorMessage(error), [NSNull null]]);
                } else {
                    callback(@[[NSNull null]]);
                }
            }];
            return;
        }
        
        callback(@[@"No ndef available", [NSNull null]]);
    } else {
        callback(@[@"Not support in this device", [NSNull null]]);
    }
}

RCT_EXPORT_METHOD(queryNDEFStatus:(nonnull RCTResponseSenderBlock)callback)
{
    if (@available(iOS 13.0, *)) {
        id<NFCNDEFTag> ndefTag = nil;
        
        if (tagSession != nil) {
            if (tagSession.connectedTag) {
                ndefTag = [self getNDEFTagHandle:tagSession.connectedTag];
            }
        }
        
        if (ndefTag) {
            [ndefTag queryNDEFStatusWithCompletionHandler:^(NFCNDEFStatus status, NSUInteger capacity, NSError *error) {
                if (error) {
                    callback(@[getErrorMessage(error), [NSNull null]]);
                } else {
                    callback(@[[NSNull null],
                               @{
                                   @"status": [[NSNumber alloc] initWithInt:(int)status],
                                   @"capacity": [[NSNumber alloc] initWithInt:(int)capacity]
                               }
                             ]);
                }
            }];
            return;
        }
        
        callback(@[@"No ndef available", [NSNull null]]);
    } else {
        callback(@[@"Not support in this device", [NSNull null]]);
    }
}

RCT_EXPORT_METHOD(setAlertMessage: (NSString *)alertMessage callback:(nonnull RCTResponseSenderBlock)callback)
{
    if (@available(iOS 11.0, *)) {
        if (session != nil) {
            session.alertMessage = alertMessage;
            callback(@[]);
        } else if (tagSession != nil) {
            tagSession.alertMessage = alertMessage;
            callback(@[]);
        } else {
            callback(@[@"Not even registered", [NSNull null]]);
        }
    } else {
        callback(@[@"Not support in this device", [NSNull null]]);
    }
}

RCT_EXPORT_METHOD(isSessionAvailable:(nonnull RCTResponseSenderBlock)callback)
{
    if (@available(iOS 11.0, *)) {
        callback(@[[NSNull null], session != nil ? @YES : @NO]);
    } else {
        callback(@[@"Not support in this device", [NSNull null]]);
    }
}

RCT_EXPORT_METHOD(isTagSessionAvailable:(nonnull RCTResponseSenderBlock)callback)
{
    if (@available(iOS 11.0, *)) {
        callback(@[[NSNull null], tagSession != nil ? @YES : @NO]);
    } else {
        callback(@[@"Not support in this device", [NSNull null]]);
    }
}
  
@end
  
