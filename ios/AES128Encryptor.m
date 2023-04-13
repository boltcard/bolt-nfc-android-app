#import <CommonCrypto/CommonCryptor.h>
#import "AES128Encryptor.h"

@implementation AES128Encryptor

// Encrypt with AES-128 CBC mode
+ (NSData *)encrypt:(NSData *)data key:(NSData *)key iv:(NSData *)iv {
  NSUInteger dataLength = [data length];
  size_t bufferSize = dataLength + kCCBlockSizeAES128;
  void *buffer = malloc(bufferSize);
  
  size_t numBytesEncrypted = 0;
  CCCryptorStatus status = CCCrypt(kCCEncrypt, kCCAlgorithmAES, ccNoPadding,
                                   [key bytes], kCCKeySizeAES128,
                                   [iv bytes],
                                   [data bytes], dataLength,
                                   buffer, bufferSize,
                                   &numBytesEncrypted);
  if (status == kCCSuccess) {
    return [NSData dataWithBytesNoCopy:buffer length:numBytesEncrypted];
  }
  
  free(buffer);
  return nil;
}

// Decrypt with AES-128 CBC mode
+ (NSData *)decrypt:(NSData *)data key:(NSData *)key iv:(NSData *)iv {
  NSUInteger dataLength = [data length];
  size_t bufferSize = dataLength + kCCBlockSizeAES128;
  void *buffer = malloc(bufferSize);
  
  size_t numBytesDecrypted = 0;
  CCCryptorStatus status = CCCrypt(kCCDecrypt, kCCAlgorithmAES, ccNoPadding,
                                   [key bytes], kCCKeySizeAES128,
                                   [iv bytes],
                                   [data bytes], dataLength,
                                   buffer, bufferSize,
                                   &numBytesDecrypted);
  if (status == kCCSuccess) {
    return [NSData dataWithBytesNoCopy:buffer length:numBytesDecrypted];
  }
  
  free(buffer);
  return nil;
}

@end
