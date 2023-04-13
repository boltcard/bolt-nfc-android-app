// AES128EncryptDecrypt.h

#import <Foundation/Foundation.h>

@interface AES128Encryptor : NSObject

+ (NSData *)encrypt:(NSData *)data key:(NSData *)key iv:(NSData *)iv;
+ (NSData *)decrypt:(NSData *)data key:(NSData *)key iv:(NSData *)iv;

@end
