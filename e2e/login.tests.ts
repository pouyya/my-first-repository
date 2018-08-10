describe('atest', function() {

    beforeEach(function(done) {
        browser.get("http://localhost:8100/");

        element(by.css('form input[name=email]')).sendKeys("t900");
        element(by.css('form input[name=password]')).sendKeys("Admin@1");
        element(by.css('form button')).click();
        setTimeout(function () {
       
            done();
        }, 40000)
    },42000);

    it('atest test one', function() {
        browser.waitForAngularEnabled(false);
        var myElement = element(by.css('ion-modal.show-page'));
        browser.waitForAngularEnabled(true);

        expect(myElement.isPresent()).toBeFalsy();

        ;
    });
    it('atest test one', function() {
        browser.waitForAngularEnabled(false);
      
        var myElement = element(by.css('ion-modal.show-page'));
        browser.waitForAngularEnabled(true);

        expect(myElement.isPresent());

        ;
    });

});