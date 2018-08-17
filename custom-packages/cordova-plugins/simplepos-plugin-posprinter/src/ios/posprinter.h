#import <Cordova/CDVPlugin.h>
#import "ePOS2.h"

@interface posprinter : CDVPlugin {
    Epos2Printer *printer;
    int printerSeries;
    int lang;
}

@property (nonatomic, strong) NSString* discoverCallbackId;
@property (nonatomic, strong) NSString* printCallbackId;

// The hooks for our plugin commands
- (void)startDiscover:(CDVInvokedUrlCommand *)command;
- (void)stopDiscover:(CDVInvokedUrlCommand *)command;
- (void)connectPrinter:(CDVInvokedUrlCommand *)command;
- (void)disconnectPrinter:(CDVInvokedUrlCommand *)command;
- (void)addText:(CDVInvokedUrlCommand *)command;
- (void)addTextAlign:(CDVInvokedUrlCommand *)command;
- (void)addTextSize:(CDVInvokedUrlCommand *)command;
- (void)addFeedLine:(CDVInvokedUrlCommand *)command;
- (void)addBarcode:(CDVInvokedUrlCommand *)command;
- (void)addCut:(CDVInvokedUrlCommand *)command;
- (void)addTextStyle:(CDVInvokedUrlCommand *)command;
- (void)addPulse:(CDVInvokedUrlCommand *)command;
- (void)print:(CDVInvokedUrlCommand *)command;

@end
