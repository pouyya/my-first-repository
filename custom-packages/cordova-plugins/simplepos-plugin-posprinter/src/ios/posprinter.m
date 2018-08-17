#import "posprinter.h"

#import <Cordova/CDVAvailability.h>

@interface posprinter()<Epos2DiscoveryDelegate, Epos2PtrReceiveDelegate>
@end

@implementation posprinter

- (void)pluginInitialize {
    printerSeries = EPOS2_TM_T82;
    lang = EPOS2_MODEL_ANK;
}

- (void)startDiscover:(CDVInvokedUrlCommand *)command {
    self.discoverCallbackId = command.callbackId;

    Epos2FilterOption *filteroption_ = [[Epos2FilterOption alloc] init];
    [filteroption_ setDeviceType:EPOS2_TYPE_PRINTER];

    int result = [Epos2Discovery start:filteroption_ delegate:self];
    if (EPOS2_SUCCESS != result) {
        NSLog(@"error in startDiscover()");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in discovering printer."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

- (void) onDiscovery:(Epos2DeviceInfo *)deviceInfo {
    NSLog(@"onDiscovery: %@", [deviceInfo getIpAddress]);
    NSDictionary *info = @{@"ipAddress" : [deviceInfo getIpAddress],
                           @"deviceType": [NSNumber numberWithInt:[deviceInfo getDeviceType]],
                           @"target": [deviceInfo getTarget],
                           @"deviceName": [deviceInfo getDeviceName],
                           @"macAddress": [deviceInfo getMacAddress],
                           @"bdAddress": [deviceInfo getBdAddress],
                           };
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:info];
    [result setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:result callbackId:self.discoverCallbackId];
}

- (void)stopDiscover:(CDVInvokedUrlCommand *)command {
    NSLog(@"stopDiscover()");
    int result = EPOS2_SUCCESS;

    while (YES) {
        result = [Epos2Discovery stop];

        if (result != EPOS2_ERR_PROCESSING) {
            break;
        }
    }

    if (EPOS2_SUCCESS != result) {
        NSLog(@"error in stopDiscover()");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in stop discovering printer."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

-(void)connectPrinter:(CDVInvokedUrlCommand *)command {
    initWithPrinterSeries:printerSeries =   [[command.arguments objectAtIndex:0] intValue];
    NSString* target = [command.arguments objectAtIndex:1];
    
    NSLog(@"connectPrinter(), ip=%@", target);

    printer = [[Epos2Printer alloc] initWithPrinterSeries:printerSeries lang:lang];

    [printer setReceiveEventDelegate:self];

    if (printer == nil) {
        NSLog(@"error in connectPrinter(), printer object not found");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in connect  printer. Printer object not found"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }

    int result = [printer connect:[NSString stringWithFormat:@"TCP:%@", target] timeout:EPOS2_PARAM_DEFAULT];
    
    if (result != EPOS2_SUCCESS) {
        NSLog(@"error in connectPrinter()");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in connect  printer."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }

    result = [printer beginTransaction];
    if (result != EPOS2_SUCCESS) {
        NSLog(@"error in beginTransaction()");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in begin transaction."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        [printer disconnect];
        return;
    }

    CDVPluginResult *cordovaResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:YES];
    [self.commandDelegate sendPluginResult:cordovaResult callbackId:command.callbackId];
}

- (void)disconnectPrinter:(CDVInvokedUrlCommand *)command {

    int result = [printer endTransaction];
    if (result != EPOS2_SUCCESS) {
        NSLog(@"error in disconnectPrinter()");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in end transaction."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }

    result = [printer disconnect];
    if (result != EPOS2_SUCCESS) {
        NSLog(@"error in disconnectPrinter()");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in disconnect printer."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
    
    [self finalizeObject];

    CDVPluginResult *cordovaResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:YES];
    [self.commandDelegate sendPluginResult:cordovaResult callbackId:command.callbackId];
}

- (void)onPtrReceive:(Epos2Printer *)printerObj code:(int)code status:(Epos2PrinterStatusInfo *)status printJobId:(NSString *)printJobId {
    NSLog(@"onPtrReceive");
    NSLog(@"code: %d", code);
    NSLog(@"status: %@", status);
    NSLog(@"printJobId: %@", printJobId);

    [self disconnectPrinter:nil];
}

- (void)addText:(CDVInvokedUrlCommand *)command {
    self.printCallbackId = command.callbackId;
    
    if (printer == nil) {
        NSLog(@"error in createPrintData()");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in create data, printer object not dound."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    NSString* printData = [command.arguments objectAtIndex:0];
    
    [self.commandDelegate runInBackground:^{
        [self processResult: [printer addText:printData]];
    }];
}

- (void)addTextAlign:(CDVInvokedUrlCommand *)command {
    self.printCallbackId = command.callbackId;
    
    if (printer == nil) {
        NSLog(@"error in createPrintData()");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in create data, printer object not dound."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    int data = [[command.arguments objectAtIndex:0] intValue];
    
    [self.commandDelegate runInBackground:^{
        [self processResult: [printer addTextAlign:data]];
    }];
}

- (void)addTextSize:(CDVInvokedUrlCommand *)command {
    self.printCallbackId = command.callbackId;
    
    if (printer == nil) {
        NSLog(@"error in createPrintData()");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in create data, printer object not dound."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    int width = [[command.arguments objectAtIndex:0] intValue];
    int height = [[command.arguments objectAtIndex:1] intValue];
    
    [self.commandDelegate runInBackground:^{
        [self processResult: [printer addTextSize: width height:height]];
    }];
}

- (void)addFeedLine:(CDVInvokedUrlCommand *)command {
    self.printCallbackId = command.callbackId;
    
    if (printer == nil) {
        NSLog(@"error in createPrintData()");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in create data, printer object not dound."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    int line = [[command.arguments objectAtIndex:0] intValue];
    
    [self.commandDelegate runInBackground:^{
        [self processResult: [printer addFeedLine:line]];
    }];
}

- (void)addBarcode:(CDVInvokedUrlCommand *)command {
    self.printCallbackId = command.callbackId;
    
    if (printer == nil) {
        NSLog(@"error in createPrintData()");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in create data, printer object not dound."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    NSString* data = [command.arguments objectAtIndex:0];
    int type = [[command.arguments objectAtIndex:1] intValue];
    int hri = [[command.arguments objectAtIndex:2] intValue];
    int font = [[command.arguments objectAtIndex:3] intValue];
    int width = [[command.arguments objectAtIndex:4] intValue];
    int height = [[command.arguments objectAtIndex:5] intValue];
    
    [self.commandDelegate runInBackground:^{
        [self processResult: [printer addBarcode:data type:type hri:hri font:font width:width height:height]];
    }];
}

- (void)addCut:(CDVInvokedUrlCommand *)command {
    self.printCallbackId = command.callbackId;
    
    if (printer == nil) {
        NSLog(@"error in createPrintData()");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in create data, printer object not dound."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    int type = [[command.arguments objectAtIndex:0] intValue];
    
    [self.commandDelegate runInBackground:^{
        [self processResult: [printer addCut:0]];
    }];
}

- (void)addTextStyle:(CDVInvokedUrlCommand *)command {
    self.printCallbackId = command.callbackId;
    
    if (printer == nil) {
        NSLog(@"error in createPrintData()");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in create data, printer object not dound."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    int reverse = [[command.arguments objectAtIndex:0] intValue];
    int ul = [[command.arguments objectAtIndex:1] intValue];
    int em = [[command.arguments objectAtIndex:2] intValue];
    int color = [[command.arguments objectAtIndex:3] intValue];
    
    [self.commandDelegate runInBackground:^{
        [self processResult: [printer addTextStyle:reverse ul:ul em:em color:color]];
    }];
}

- (void)addPulse:(CDVInvokedUrlCommand *)command {
    self.printCallbackId = command.callbackId;
    
    if (printer == nil) {
        NSLog(@"error in createPrintData()");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in create data, printer object not dound."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }
    
    int drawer = [[command.arguments objectAtIndex:0] intValue];
    int time = [[command.arguments objectAtIndex:1] intValue];
    
    [self.commandDelegate runInBackground:^{
        [self processResult: [printer addPulse:drawer time:time]];
    }];
}

- (void)print:(CDVInvokedUrlCommand *)command {
    self.printCallbackId = command.callbackId;

    if (printer == nil) {
        NSLog(@"error in createPrintData()");
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in create data, printer object not dound."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }

    [self.commandDelegate runInBackground:^{
        [self processResult: [printer sendData:EPOS2_PARAM_DEFAULT]];
    }];
}

- (void)processResult: (int) result {
    if (result != EPOS2_SUCCESS) {
        [printer disconnect];
        
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Error in print data."];
        [self.commandDelegate sendPluginResult:result callbackId:self.printCallbackId];
        return;
    }
    
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:self.printCallbackId];
    return;
}

- (void)finalizeObject
{
    if (printer == nil) {
        return;
    }
    
    [printer clearCommandBuffer];
    
    [printer setReceiveEventDelegate:nil];
    
    printer = nil;
}

@end
