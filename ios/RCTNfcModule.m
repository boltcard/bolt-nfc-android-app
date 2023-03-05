//
//  RCTNfcModule.m
//  lightningnfcapp
//
//  Created by Hyojae Jung on 27/02/23.
//

#import "RCTNfcModule.h"
#import "TapLinxLibrary.h"
#import <React/RCTLog.h>


@implementation RCTNfcModule

RCT_EXPORT_METHOD(verifyLicense) {
  RCTLogInfo(@"Verifing license");
  TapLinxLibrary *taplinxLibrary = [TapLinxLibrary sharedLibrary];
  [taplinxLibrary verifyLicense:@"87f293036c2e5cd0092055f45da295ed" WithCompletionHandler:^(BOOL isSuccess) {
      if (isSuccess) {
          // success
          RCTLogInfo(@"Verifing license success");
      } else {
          // failed
          RCTLogInfo(@"Verifing license failed");
      }
  }];
  
  NSString *base64String = @"IdHhqzL1Eyn/Q+iM7Al2ZMiMDr/atXGN6LI9Q3viETm0SWwdLYs8WHZZtUPRDeiAs59ae673SUlQoExOBOezsk5r9wcpSfp+dqRKAFqfeB2ck/ExVTabaRlWJ/MjprIzkFPMa6qwXidxFpoSm3yrWs3elanBCeyTUkDkoR0QjhheF8Y5Oi+fZ3dJVu53/eVy2LL0QbfOzzaY3CQsYxWa0/EHWLMMq7MpYJicKzUAwcJYi4YI/xVN4ATXeeGkimtgo9BTFWiP+wY8B1aq+3i4J51FkyLjCCFrWCESNClGKpfomICVHUbiJfxcXp8tm5UeiZXQTGag0SSMui03/frU2w==";
  NSData *base64Data = [[NSData alloc] initWithBase64EncodedString:base64String options:0];
  NSString *decodedString = [[NSString alloc] initWithData:base64Data encoding:NSUTF8StringEncoding];

}

RCT_EXPORT_METHOD(readNfc) {
  RCTLogInfo(@"reading NFC");
  
}
RCT_EXPORT_MODULE(MyReactModule);

@end
