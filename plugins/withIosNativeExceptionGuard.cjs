const { IOSConfig, createRunOncePlugin } = require("expo/config-plugins");

const SOURCE = `/**
 * iOS 26 + React Native release builds abort when any native module throws.
 * RCTNativeModule.mm calls RCTFatalException, which rethrows and kills the process.
 * Install a handler so those exceptions are logged instead of aborting launch.
 */
#import <Foundation/Foundation.h>
#import <React/RCTAssert.h>

@interface NMRFatalExceptionGuard : NSObject
@end

@implementation NMRFatalExceptionGuard

+ (void)load
{
  RCTSetFatalExceptionHandler(^(NSException *exception) {
    NSLog(@"[Nudge me Ready] native module exception (continuing): %@: %@", exception.name, exception.reason);
  });
  RCTSetFatalHandler(^(NSError *error) {
    NSLog(@"[Nudge me Ready] native fatal (continuing): %@", error.localizedDescription);
  });
}

@end
`;

function withIosNativeExceptionGuard(config) {
  return IOSConfig.XcodeProjectFile.withBuildSourceFile(config, {
    filePath: "NMRFatalExceptionGuard.m",
    contents: SOURCE,
    overwrite: true
  });
}

module.exports = createRunOncePlugin(
  withIosNativeExceptionGuard,
  "nudgemeready-ios-native-exception-guard",
  "1.0.0"
);
