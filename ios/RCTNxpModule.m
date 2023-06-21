//
//  RCTNxpModule.m
//  lightningnfcapp
//
//

#import "RCTNxpModule.h"
#import <React/RCTLog.h>
#import <React/RCTConvert.h>
#import <CommonCrypto/CommonCryptor.h>

@implementation RCTNxpModule

RCT_EXPORT_METHOD(doAesDecrypt:(NSData *)data
                  key:(NSData *)key
                  iv:(NSData *)iv
                  errorCallback: (RCTResponseSenderBlock)errorCallback
                  successCallback: (RCTResponseSenderBlock)successCallback)
{
  
  NSUInteger dataLength = [data length];
  size_t bufferSize = dataLength + kCCBlockSizeAES128;
  void *buffer = malloc(bufferSize);
  
  size_t numBytesDecrypted = 0;
  CCCryptorStatus status = CCCrypt(kCCDecrypt, kCCAlgorithmAES, 0,
                                   [key bytes], kCCKeySizeAES128,
                                   [iv bytes],
                                   [data bytes], dataLength,
                                   buffer, bufferSize,
                                   &numBytesDecrypted);
  if (status == kCCSuccess) {
    NSData *decryptedData = [NSData dataWithBytesNoCopy:buffer length:numBytesDecrypted];
    RCTLogInfo(@"doAESDecrypt: %@", decryptedData);
    successCallback(@[[RCTConvert NSData:decryptedData]]);
  }
  
  free(buffer);
  errorCallback(@[[NSException exceptionWithName:NSInvalidArgumentException reason:@"Decryption gone wrong" userInfo:nil]]);
}

RCT_EXPORT_METHOD(doAesEncrypt:(NSData *)data
                  key:(NSData *)key
                  iv:(NSData *)iv
                  errorCallback: (RCTResponseSenderBlock)errorCallback
                  successCallback: (RCTResponseSenderBlock)successCallback)
{
  NSUInteger dataLength = [data length];
  size_t bufferSize = dataLength + kCCBlockSizeAES128;
  void *buffer = malloc(bufferSize);
  
  size_t numBytesEncrypted = 0;
  CCCryptorStatus status = CCCrypt(kCCEncrypt, kCCAlgorithmAES, 0,
                                   [key bytes], kCCKeySizeAES128,
                                   [iv bytes],
                                   [data bytes], dataLength,
                                   buffer, bufferSize,
                                   &numBytesEncrypted);
  if (status == kCCSuccess) {
    NSData *encryptedData = [NSData dataWithBytesNoCopy:buffer length:numBytesEncrypted];
    RCTLogInfo(@"doAESEncrypt: %@", encryptedData);
    successCallback(@[[RCTConvert NSData:encryptedData]]);
  }
  
  free(buffer);
  
  errorCallback(@[[NSException exceptionWithName:NSInvalidArgumentException reason:@"Decryption gone wrong" userInfo:nil]]);
}

RCT_EXPORT_MODULE();

@end
