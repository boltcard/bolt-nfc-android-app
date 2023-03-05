/*
 Copyright 2021 - 2022 NXP.
 NXP Confidential. This software is owned or controlled by NXP and may only be used strictly in accordance with the applicable license terms.
 By expressly accepting such terms or by downloading, installing, activating and/or otherwise using the software,
 you are agreeing that you have read, and that you agree to comply with and are bound by, such license terms.
 If you do not agree to be bound by the applicable license terms, then you may not retain, install, activate or otherwise use the software.
 */

#import <Foundation/Foundation.h>
#import "IOSPrimitiveArray.h"
#import "MIFARELibraryManager.h"
#import "TL_Constants.h"
#import "CreateAppSettingsModel.h"

NS_ASSUME_NONNULL_BEGIN

/// Block which returns IOSByteArray and BOOL for success status
typedef void (^completionBlockWithIOSByteArray) (IOSByteArray *response, BOOL success);

/// Block which returns IOSIntArray and BOOL for success status
typedef void (^completionBlockWithIOSIntArray) (IOSIntArray *response, BOOL success);

/// Block which returns BOOL for success status
typedef void (^completionBlockWithResult) (BOOL success);

/// Block which returns `jint` as response and `BOOL` for success status
typedef void (^completionBlockWithjint) (jint response, BOOL success);

/// Block which returns NSString as failure message
typedef void (^completionBlockWithFailureMessage) (NSString *message);

/// Block which returns with result object of specific type
typedef void (^completionBlockWithResultObject) (id result);

/// Interface to communicate with DESFireEV2 APIs
@interface TL_DESFireEV2 : NSObject{
    ///  MIFARE Library Manager instance 
    MIFARELibraryManager *libraryManager;
}

#pragma mark - Application Init

/**
 * Create Instance of DESFire EV2 with Library Manager
 *
 * @param libraryManager library manager for building custom modules
 * @return id
 */
-(id)initDesFireEV2WithLibraryManager : (MIFARELibraryManager *)libraryManager;

#pragma mark - GetVersion

/**
 * Returns version of the PICC
 */
-(void)getVersionOnCompletion: (completionBlockWithIOSByteArray) completion;

#pragma mark - GetCardUID

/**
 * Returns the manufacturer UID written on the card.
 */
-(void)getCardUIDOnCompletion: (completionBlockWithIOSByteArray) completion;

#pragma mark - File Management

/**
 * Creates Standard data file for the storage of plain unformatted user data within an existing application on the PICC.
 * @param fileID used to create Standard data file
 * @param fileSize used to allocate memory for the file to be created
 * @param readAccess used to set access to read from the file
 * @param writeAccess used to set access to  write to the file
 * @param readWriteAccess used to set readWrite acccess of the file
 * @param changeAccess used to set change access of the file
 */
- (void)createStandardFileWithFileID: (int)fileID
                         andFileSize: (int)fileSize
                   CommunicationType: (CommunicationType)commType
                        withReadByte: (jbyte)readAccess
                       withWriteByte: (jbyte)writeAccess
                   withReadWriteByte: (jbyte)readWriteAccess
                      withChangeByte: (jbyte)changeAccess
                        OnCompletion: (completionBlockWithResult) completion;

/**
 * Returns the File IDentifiers of all active files within the currently selected application.
 */
-(void)getFileIDsOnCompletion: (completionBlockWithIOSByteArray) completion;

/**
 * Gets information on the properties of a specific file.
 *
 * @param fileID  settings of the  file to be fetched
 */
-(void)getFileSettingsWithInt: (jint) fileID
                 OnCompletion: (completionBlockWithResult) completion;

/**
 * Changes the access parameters of an existing file
 *
 * @param fileNo Settings of file no to be changed
 * @param fileType to provide the type of the file
 * @param commType to determine communication type of the file
 * @param readAccess provide read access to update
 * @param writeAccess provide write access to update
 * @param readWriteAccess provide read write access to update
 * @param changeAccess provide change access to update
 */
-(void)changeFileSettingsWithFileNO: (jint) fileNo
                        andfileType: (enum FileType) fileType
                  CommunicationType: (CommunicationType) commType
                       withReadByte: (jbyte)readAccess
                      withWriteByte: (jbyte)writeAccess
                  withWriteReadByte: (jbyte)readWriteAccess
                   withChangeAccess: (jbyte)changeAccess
                       OnCompletion: (completionBlockWithResult) completion;

/**
 * Permanently deactivates a file within the file directory of the currently selected application
 *
 * @param fileNo set to File no to be deleted
 */
-(void)deleteFileWithFileNo: (jint)fileNo
               OnCompletion: (completionBlockWithResult) completion;

/**
 * Creates Backup Data file on the selected application of a PICC,
 * which additionally supporting the feature of an integrated backup mechanism.
 * @param fileID used to create Backup data file
 * @param fileSize used to allocate memory for the file to be created
 * @param readAccess used to set access to read from the file
 * @param writeAccess used to set access to  write to the file
 * @param readWriteAccess used to set readWrite acccess of the file
 * @param changeAccess used to set change access of the file
 */
-(void)createBackupDataFileWithFileID: (int)fileID
                          andFileSize: (int) fileSize
                    CommunicationType: (CommunicationType) commType
                         withReadByte: (jbyte)readAccess
                        withWriteByte: (jbyte)writeAccess
                    withReadWriteByte: (jbyte)readWriteAccess
                       withChangeByte: (jbyte)changeAccess
                         OnCompletion: (completionBlockWithResult) completion;

/**
 * Creates a Transaction MAC File and enables the Transaction MAC feature for the targeted application.
 *
 * @param fileID used to create Transaction MAC file
 * @param commType used to set type of communication
 * @param readAccess used to set access to read from the file
 * @param writeAccess used to set access to  write to the file
 * @param readWriteAccess used to set readWrite acccess of the file
 * @param changeAccess used to set change access of the file
 * @param tmKeyOption to set  tmKeyOption Value
 * @param tmKey to set Trasaction MAC key value
 * @param tmKeyVersion to set version of Transaction MAC Key
 */
- (void)createTransactionMACFileWithFileID: (int)fileID
                         CommunicationType: (CommunicationType)commType
                              withReadByte: (jbyte)readAccess
                             withWriteByte: (jbyte)writeAccess
                         withReadWriteByte: (jbyte)readWriteAccess
                            withChangeByte: (jbyte)changeAccess
                       withTMKeyOptionByte: (jbyte)tmKeyOption
                        withTMKeyByteArray: (IOSByteArray *)tmKey
                      withTMKeyVersionByte: (jbyte)tmKeyVersion
                              OnCompletion: (completionBlockWithResult)completion;
/**
 * Creates Value file for the storage and manipulation of 32bit signed integer values within an existing application on the PICC.
 *
 * @param fileID used to create Value file
 * @param fileSize used to allocate memory for the file
 * @param commType used to set type of communication
 * @param lowerLimit to set lower limit of the value
 * @param upperLimit for to set upper limit of the value
 * @param initialValue to set intial value of the value file
 * @param readAccess to set read access of the file
 * @param writeAccess to set write access of the file
 * @param readWriteAccess to set read write access of the file
 * @param changeAccess to set change access of the file
 * @param limitedCreditEnable set to true to enable
 * @param getFreeValue used to set to true to get free value
 */
-(void)createValueFileWithFileID: (int)fileID andFileSize:(int) fileSize
            andCommunicationType: (CommunicationType) commType
                  withLowerLimit: (int)lowerLimit
                  withUpperLimit: (int)upperLimit
                    withReadByte: (jbyte)readAccess
                   withWriteByte: (jbyte)writeAccess
               withReadWriteByte: (jbyte)readWriteAccess
                  withChangeByte: (jbyte)changeAccess
                 andInitialValue: (jint)initialValue
          andEnablelimitedCredit: (BOOL)limitedCreditEnable
                 andGetFreeValue: (BOOL)getFreeValue
                    OnCompletion: (completionBlockWithResult) completion;


/**
 * Set Debit for file without communication type
 *
 * @param fileNo to which Debit is set
 * @param value to be debited
 */
-(void)setDebit: (int)fileNo
        withInt: (int)value
   OnCompletion: (completionBlockWithResult) completion;

/**
 * Set Debit for file with communication type
 *
 * @param fileNo to which Debit is set
 * @param value to be debited
 * @param commType to set communication type
 */
- (void)debitWithInt: (int)fileNo
             withInt: (int)value
andCommunicationType: (CommunicationType) commType
        OnCompletion: (completionBlockWithResult) completion;

/**
 * Set Credit for file without communication type
 *
 * @param fileNo to which credit is set
 * @param value to be credited
 */
-(void)setCredit: (int)fileNo
         withInt: (int)value
    OnCompletion: (completionBlockWithResult) completion;

/**
 * Set Credit for file with communication type
 *
 * @param fileNo to which credit is set
 * @param value to be credited
 * @param commType to set communication type
 */
- (void)creditWithInt: (int)fileNo
              withInt: (int)value
 andCommunicationType: (CommunicationType) commType
         OnCompletion: (completionBlockWithResult) completion;

/**
 * Set Limited Credit for file without communication type
 *
 * @param fileNo to which Limited credit is set
 * @param value to be credited
 */
-(void)setLimitedCreditWithoutCommunicationTypeForFileNo: (int)fileNo
                                                andValue: (int)value
                                            OnCompletion: (completionBlockWithResult) completion;

/**
 * Set Limited Credit for file with communication type
 *
 * @param fileNo to which Limited credit is set
 * @param value to be credited
 * @param commType to set communication type
 */
-(void)setLimitedCreditWithCommunicationTypeForFileNo: (int)fileNo
                                             andValue: (int)value
                                 andCommunicationType: (CommunicationType) commType
                                         OnCompletion: (completionBlockWithResult) completion;

#pragma mark - ISO File Management

/**
 * Create ISO File
 *
 * @param fileNumber to create
 * @param bisoFileID to create
 * @param fileSize to allocate memory
 * @param readAccess used to set access to read from the file
 * @param writeAccess used to set access to  write to the file
 * @param readWriteAccess used to set readWrite acccess of the file
 * @param changeAccess used to set change access of the file
 */
- (void)createISOFileWithFileNo: (int)fileNumber
                withbISOFileId : (IOSByteArray *)bisoFileID
                    andFileSize: (int) fileSize
              CommunicationType: (CommunicationType) commType
                   withReadByte: (jbyte)readAccess
                  withWriteByte: (jbyte)writeAccess
              withReadWriteByte: (jbyte)readWriteAccess
                 withChangeByte: (jbyte)changeAccess
                   OnCompletion: (completionBlockWithResult) completion;

/**
 * Returns the 2 byte ISO/IEC 7816-4 File Identifiers of all active files within the currently selected application
 */
-(void)getISOFileIDsOnCompletion: (completionBlockWithIOSIntArray) completion;

/**
 * Selects ISOSelectMasterFile for card type
 */
-(void)isoSelectMasterFileOnCompletion: (completionBlockWithResult) completion;

/**
 * Select an application or file
 *
 * @param fileID to be selected
 * @param selectionControl to set
 */
-(void)isoSelectFile: (IOSByteArray *)fileID
    andselectControl: (jbyte)selectionControl
        OnCompletion: (completionBlockWithResult) completion;

/**
 * Read from a data file
 *
 * @param offset from where to start reading
 * @param bytes number of bytes to read
 */
-(void)ISOReadBinaryWithOffset: (jint) offset
                      andBytes: (jint)bytes
                  onCompletion: (completionBlockWithIOSByteArray) completion;

/**
 * Write to a data file
 *
 * @param fileID to which to write
 * @param offset from where to start updating
 * @param data to be written
 */
-(void)isoUpdateBinaryWithByteArray: (IOSByteArray *)fileID
                         withOffset: (jint)offset
                  withdataByteArray: (IOSByteArray *)data
                      onCompletion : (completionBlockWithResult) completion;

#pragma mark - Authentication Command

/**
 * Get Authentication Status
 */
-(void)getAuthStatusOnCompletion : (completionBlockWithResult) completion;

/**
 * Reset Authentication
 */
- (void)resetAuthentication:(completionBlockWithResult)completion;

/**
 * Authenticate to PICC or application of AuthType Native, ISO or AES.
 *
 * @param cardkeyNo takes the card Key number to be authenticated
 * @param authType takes the Authentication Type as Native, ISO, or AES
 * @param commandSet takes value as ISO or Native
 * @param authkeyType takes value of KeyType
 * @param authKey to authenticate Key Value of type either AES or DES
 */
- (void)authenticate: (int)cardkeyNo
            AuthType: (enum AuthType)authType
             KeyType: (enum KeyType) authkeyType
          CommandSet: (enum CommandSet)commandSet
                 key: (NSData *)authKey
       OnCompletion : (completionBlockWithResult) completion;



#pragma mark - Select Application Command

/**
 * Selects an application at PICC Level.
 */
-(void)selectApplicationPICCP1OnCompletion : (completionBlockWithResult) completion;

/**
 * Deletes an application.
 * @param appID takes application ID to be deleted
 */
-(void)deleteApplicationWithInt: (jint)appID
                   OnCompletion: (completionBlockWithResult) completion;

/**
 * Returns the ISO/IEC 7816-4 DF-Names of all the active applications on a PICC.
 */
-(void)getDFNameOnCompletion: (completionBlockWithResult) completion;

#pragma mark - Key Management

/**
 * Updates key stored on the PICC.
 *
 * @param cardkeyNo takes the Key number of the card to be used
 * @param authkeyType takes the authentication type as Native, ISO, or AES
 * @param fromKey takes value as  Native or AES
 * @param toKey takes value as  Native or AES
 */
-(void)changeKey:(int)cardkeyNo
         KeyType: (enum KeyType) authkeyType
         fromKey: (NSData *)fromKey
           toKey: (NSData *)toKey
    OnCompletion: (completionBlockWithResult) completion;


/**
 * Updates a key of the PICC or of one specified application key set.
 *
 * @param keySetNumber indicates the key set number of the application
 * @param cardKeyNumber takes the  Key number of the card to be used
 * @param authKeyType takes the authentication type as Native, ISO, or AES
 * @param fromKey takes value as  Native or AES
 * @param toKey takes value as  Native or AES
 */
- (void)ev2ChangeKeyWithKeySetNo: (jint)keySetNumber
                   withCardKeyNo: (jint)cardKeyNumber
                     withKeyType: (enum KeyType)authKeyType
                     withFromKey: (NSData *)fromKey
                       withToKey: (NSData *)toKey
               withNewKeyVersion: (jbyte)newKeyVersion
                    OnCompletion:(completionBlockWithResult)completion;

/**
 * Retrieves the PICCKeySettings of the PICC or the AppKeySettings of the (primary) application.
 */
-(void)getKeySettingsOnCompletion: (completionBlockWithResultObject) success
                          failure: (completionBlockWithFailureMessage) failureMessage;

/**
 * Depending on the currently selected application, initialize the key set with specific Key
 *
 * @param keySetbyte to create key set
 * @param keyType to determine key type
 */
-(void)initializeKeySetWithByte: (jbyte) keySetbyte
                     andKeyType: (enum KeyType) keyType
                   onCompletion: (completionBlockWithResult) completion;

/**
 * Within the currently selected application, finalize the key set with specified number and key set version.
 *
 * @param keySetNumber for finalizing key set
 * @param keySetVersion for finializing key set version
 */
-(void)finalizeKeySetWithByte: (jbyte) keySetNumber
             andKeySetVersion: (jbyte) keySetVersion
                 onCompletion: (completionBlockWithResult) completion;

/**
 * Changes the Active Key Set to the point to key set currently targeted with the given KeySetNo
 *
 * @param ikeySetNo for rolling key set
 */
-(void)rollKeySetWithByte: (jbyte) ikeySetNo
             onCompletion: (completionBlockWithResult) completion;

/**
 * Gets the version of key with keyNo in a selected application
 *
 * @param keyNo to get version of key
 */
-(void)getKeyVersionForKeyNumber: (jint)keyNo
                    onCompletion: (completionBlockWithIOSByteArray) completion;


#pragma mark - Application Management

/**
 * Creates new application on the PICC.
 *
 * @param applicationID to be used to create application
 * @param noOfBytes to allocate memory for the application to be created
 * @param settings takes the values to create App Settings
 */
-(void)createApplicationWithID: (int)applicationID
              andNumberOfBytes: (int)noOfBytes
                  withSettings: (CreateAppSettingsModel *) settings
                 onCompletion : (completionBlockWithResult) completion;

/**
 * Selects a single application.
 *
 * @param applicationID  to create an application to be used
 * @param noOfBytes to allocate memory for the newly created application
 */
-(void)selectApplicationWithID: (int)applicationID
              andNumberOfBytes: (int)noOfBytes
                 onCompletion : (completionBlockWithResult) completion;

/**
 * Returns the application identifiers of all active applications on a PICC.
 */
-(void)getApplicationIDsOnCompletion: (completionBlockWithResult) completion;

/**
 * Selects firstAppID as primary application and secondAppID as secondary application
 *
 * @param firstAppID to be used as Primary Application
 * @param secondAppID to be used as Secondary application
 */
-(void)selectApplicationsFirstAppID: (int)firstAppID
                    andSecondAppID : (int)secondAppID
                      onCompletion : (completionBlockWithResult) completion;

/**
 * Activate Secondary Application
 *
 */
-(void)activateSecondaryApplicationonCompletion: (completionBlockWithResult) completion;

/**
 * De Activate Secondary Application
 */
-(void)deActivateSecondaryApplicationonCompletion: (completionBlockWithResult) completion;

#pragma mark - ISO Create Application

/**
 * Creates an  ISO Application
 *
 * @param applicationID to create
 * @param isoFileID array
 * @param noOfBytes to allocate memory
 * @param keyType takes the value as Native, ISO
 * @param dfName as byteArray
 */
-(void)createISOApplicationWithID: (int)applicationID
                     andISOFileId: (IOSByteArray *)isoFileID
                 andNumberOfBytes: (int)noOfBytes
                       forKeyType: (KeyType )keyType
                        andDfName: (IOSByteArray *)dfName
                     OnCompletion: (completionBlockWithResult) completion;


#pragma mark - ISO Commands

/**
 * Selects the given IID or DF name as per ISO 7816 terminology
 *
 * @param dfName of the challenge
 * @param keyData of the challenge
 */
-(void)isoSelect: (IOSByteArray *)dfName
     WithkeyData: (NSData *)keyData
    OnCompletion: (completionBlockWithResult) completion;

/**
 * Selects the given IID or DF name as per ISO 7816 terminology
 *
 * @param dfName of the challenge
 */
-(void)isoSelect: (IOSByteArray *)dfName
    OnCompletion: (completionBlockWithResult) completion;


/**
 * Implements the ISO/IEC 7816-4 authentication procedure using GetChallenge authenticate
 *
 * @param length of the challenge
 */
-(void)isoGetChallengeWithInt: (int)length
                 OnCompletion: (completionBlockWithResult) completion;

/**
 * Authenticate the PICC (third part of ISO7816-4 authentication)
 *
 * @param authKey to authenticate with
 */
-(void)ISOInternalAuthenticateWithkey: (NSData *)authKey
                           andkeyType: (KeyType) keyType
                         OnCompletion: (completionBlockWithResult) completion;

/**
 * Authenticate the PCD (second part of ISO7816-4 authentication)
 *
 * @param authKey to authenticate with
 */
-(void)ISOExternalAuthenticateWithkey: (NSData *)authKey
                         OnCompletion: (completionBlockWithResult) completion;

#pragma mark - Record Data

/**
 * Creates Linear Record file for multiple storage of structural similar data within an existing application on the PICC.
 *
 * @param fileID used to create Linear Record file
 * @param recordSize used to allocate record size in the file
 * @param maximumNoOfRecord used to set maximum no of records
 * @param currentNoOfRecords to set current no of records in the file
 * @param readAccess used to set access to read from the file
 * @param writeAccess used to set access to  write to the file
 * @param readWriteAccess used to set readWrite acccess of the file
 * @param changeAccess used to set change access of the file
 * @param commType to define communication type
 * @param isoFileIDBytes to provide ISO File ID
 */
-(void)createLinearRecordFile: (int)fileID
                  andFileSize: (int) recordSize
                  withMaxSize: (int)maximumNoOfRecord
         andCurrentNoOfRecord: (int)currentNoOfRecords
                 withReadByte: (jbyte)readAccess
                withWriteByte: (jbyte)writeAccess
            withWriteReadByte: (jbyte)readWriteAccess
             withChangeAccess: (jbyte)changeAccess
         andCommunicationType: (CommunicationType) commType
        withOptionalISOFileID: (IOSByteArray *)isoFileIDBytes
                 OnCompletion: (completionBlockWithResult) completion;

/**
 * Creates yclic Record file for multiple storage of structural similar data within an existing application on the PICC.
 * Once the file is filled completely with data records, the PICC automatically overwrites the oldest record with the latest written one.
 *
 * @param fileID used to create Linear Record file
 * @param recordSize used to allocate record size in the file
 * @param maximumNoOfRecord used to set maximum no of records
 * @param currentNoOfRecords to set current no of records in the file
 * @param readAccess used to set access to read from the file
 * @param writeAccess used to set access to  write to the file
 * @param readWriteAccess used to set readWrite acccess of the file
 * @param changeAccess used to set change access of the file
 * @param commType to define communication type
 * @param isoFileIDBytes to provide ISO File ID
 */
-(void)createCyclicRecordFile: (int)fileID
                  andFileSize: (int) recordSize
                  withMaxSize: (int)maximumNoOfRecord
         andCurrentNoOfRecord: (int)currentNoOfRecords
                 withReadByte: (jbyte)readAccess
                withWriteByte: (jbyte)writeAccess
            withWriteReadByte: (jbyte)readWriteAccess
             withChangeAccess: (jbyte)changeAccess
         andCommunicationType: (CommunicationType) commType
        withOptionalISOFileID: (IOSByteArray *)isoFileIDBytes
                 OnCompletion: (completionBlockWithResult) completion;

/**
 * Create Transaction Mac File
 *
 * @param commType to define communication type
 * @param fileID to create
 * @param readAccess to set
 * @param writeAccess to set
 * @param readWriteAccess to set
 * @param changeAccess to set
 * @param tmKey for authentication
 * @param tmKeyOptions for the tmKey
 * @param tmKeyVersion for tmKey
 */
-(void)createTransactionMacFileWithCommunicationType: (CommunicationType) commType
                                          withFileID: (int)fileID
                                        withReadByte: (jbyte)readAccess
                                       withWriteByte: (jbyte)writeAccess
                                   withReadWriteByte: (jbyte)readWriteAccess
                                      withChangeByte: (jbyte)changeAccess
                                  WithTransactionkey: (NSData *)tmKey
                                     andtmKeyOptions: (jbyte)tmKeyOptions
                                     andtmKeyVersion: (jbyte)tmKeyVersion
                                        OnCompletion: (completionBlockWithResult) completion;
/**
 * Write a new record to a record file
 *
 * @param recordNumber to append data
 * @param referenceControl inside a file
 * @param data to append
 */
-(void)ISOAppendRecordWithNumber: (jbyte)recordNumber
                        withByte: (jbyte)referenceControl
                         andData: (IOSByteArray *)data
                    OnCompletion: (completionBlockWithResult) completion;

/**
 * Read from a record file
 *
 * @param recordNumber to append data
 * @param referenceControl inside a file
 * @param bytesToRead to read record
 */
-(void)ISOReadRecordWithNumber: (jbyte)recordNumber
                      withByte: (jbyte)referenceControl
                       andData: (jint)bytesToRead
                  OnCompletion: (completionBlockWithIOSByteArray) completion;

#pragma mark - Authenticate Transactions

/**
 * Authenticate EV2 First to the PICC using single AES. This authentication is intended to be the first in a transaction.
 *
 * @param cardKeyNo takes the card Key number to be authenticated
 * @param authKey takes the key for authentication
 * @param data as pCDcap2
 */
-(void)AuthenticateEV2FirstWithInt: (jint)cardKeyNo
                           Withkey: (NSData *)authKey
                           andData: (IOSByteArray *)data
                      OnCompletion: (completionBlockWithResult) completion;

/**
 * Authentication EV2 Non First for KeyType.AES keys.
 * Non first is intended for any subsequent authentication after First authentication in a transaction.
 *
 * @param cardKeyNo takes the card Key number to be autheticated
 * @param authKey takes the key for authentication
 * @param data as pCDcap2
 */
-(void)AuthenticateEV2NonFirst: (jint)cardKeyNo
                       Withkey: (NSData *)authKey
                       andData: (IOSByteArray *)data
                  OnCompletion: (completionBlockWithResult) completion;

#pragma mark - Data Management

/**
 * Reads data from FileType.StandardData, FileType.BackupData or FileType.TransactionMAC files.
 *
 * @param fileNo file no to be read
 * @param offset position to start reading
 * @param length number of bytes to read from a file
 */
-(void)readDataWithFileno: (jint)fileNo
               withOffset: (jint)offset
               withLength: (jint)length
             onCompletion: (completionBlockWithIOSByteArray) completion;

/**
 * Writes data to StandardData and BackupData files.
 *
 * @param fileNo file no to be write
 * @param offset position to start writing
 * @param data  Data to write to the file
 */
-(void)writeDataWithFileno: (jint)fileNo
                withOffset: (jint)offset
             withByteArray: (IOSByteArray *)data
              onCompletion: (completionBlockWithResult) completion;

/**
 * Reads the currently stored value from Value Files.
 *
 * @param fileNo File no to be used to get Value
 */
-(void)getValueWithFileNo:(jint)fileNo
             onCompletion: (completionBlockWithjint) completion;

/**
 * Read out a set of complete records from a Cyclic or Linear Record File.
 *
 * @param fileNo to be used to read records from
 * @param offsetRecords position to start reading
 * @param noOfRecords number of records to be read
 */
-(void)readRecordWithFileNo: (jint)fileNo
           withOffserRecord: (jint)offsetRecords
        withNumberOfRecords: (jint)noOfRecords
               onCompletion: (completionBlockWithIOSByteArray) completion;

/**
 * Writes data to a record in a Cyclic or Linear Record File.
 *
 * @param fileNo  to be used to write records to
 * @param offsetInRecord position to start writing data
 * @param data to write in a record
 */
-(void)writeRecordWithFileNo: (jint)fileNo
          withOffsetInRecord: (jint)offsetInRecord
               withByteArray: (IOSByteArray *)data
                onCompletion: (completionBlockWithResult) completion;

/**
 * Updates data of an existing record in a Cyclic or Linear Record File.
 *
 * @param fileNo to be used to update records in it
 * @param recordNo to be updated
 * @param offsetInRecord  position to start updating
 * @param data to update in the specified record
 * @param commType to determine communication type
 */
- (void)updateRecordWithInt: (jint)fileNo
                    withInt: (jint)recordNo
                    withInt: (jint)offsetInRecord
              withByteArray: (IOSByteArray *)data
       andCommunicationType: (enum CommunicationType) commType
               onCompletion: (completionBlockWithResult) completion;

/**
 * Clear all records  in a Cyclic or Linear Record File.
 *
 * @param fileNo from which the records to be cleared
 */
-(void)clearRecordForFileNo:(jint)fileNo
               onCompletion: (completionBlockWithResult) completion;

/**
 * Increases a value stored in a Value File.
 *
 * @param fileNo file no to be credited to
 * @param value value to be credited in the specified file
 */
-(void)creditWithFileno: (jint)fileNo
              withValue: (jint)value
           onCompletion: (completionBlockWithResult) completion;
/**
 * Allows a limited increase of a value stored in a Value File without having full Credit permissions to the file.
 *
 * @param fileNo file no to be credited to
 * @param value value to be credited in the specified file
 */
-(void)limitedCreditWithFileno: (jint)fileNo
                     withValue: (jint)value
                  onCompletion: (completionBlockWithResult) completion;

/**
 * Decreases a value stored in a Value File.
 *
 * @param fileNo file no to be debited from
 * @param value value to be debited from a specified file
 */
-(void)debitWithFileno:(jint)fileNo
             withValue:(jint)value
          onCompletion: (completionBlockWithResult) completion;

#pragma mark - Transaction Management

/**
 * Validates all previous write accesses on Data Files, Value Files andRecord Files within the selected application.
 * Ifapplicable, the FileType.TransactionMAC file is updated with the calculated Transaction MAC.
 */
-(void)commitTransactionOnCompletion: (completionBlockWithResult) completion;

/**
 * Aborts all previous write accesses on backup Data Files, Value Files and Record Files within the selected application(s).
 * If applicable, the Transaction MAC calculation is aborted
 */
-(void)abortTransactionOnCompletion: (completionBlockWithResult) completion;

/**
 * Commits a ReaderID for the ongoing transaction.
 */
-(void)commitReaderID:(IOSByteArray *)tmri
         onCompletion: (completionBlockWithIOSByteArray) completion;

/**
 * Commits Trasaction and Gets Transaction MAC Value.
 */
-(void)commitAndGetTransactionMac: (completionBlockWithIOSByteArray) completion;

#pragma mark - Originality Check

/**
 * Retrieve the ECC originality check signature
 */
-(void)readSignatureonCompletion: (completionBlockWithIOSByteArray) completion;

#pragma mark - Format

/**
 * Format card - all applications and files will be deleted.
 * The deleted memory is released and can be reused.
 * Requires preceding authentication with PICC master key and selected application has to be 0.
 */
-(void)formatCardonCompletion: (completionBlockWithResult) completion;


/**
 * Returns the available bytes on the PICC.
 */
-(void)getFreeMemoryonCompletion: (completionBlockWithjint) completion;

@end

NS_ASSUME_NONNULL_END
