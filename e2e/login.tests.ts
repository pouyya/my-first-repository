
describe('test desc', function () {


    beforeAll(async function (done) {
        browser.get('');
        var until = protractor.ExpectedConditions;
        await browser.wait(until.presenceOf(element(by.css('form input[name=email]'))));

        element(by.css('form input[name=email]')).sendKeys(browser.params.login.username);
        element(by.css('form input[name=password]')).sendKeys(browser.params.login.password);
        await element(by.css('form button')).click();
        setTimeout(()=> {      
            done();
        }, 35000);//Time to pass wizard manually
        
    },700000);

    it('should show list of register items',async function (done) {
        console.log('should show list of register items');
        expect(element.all(by.css('div.activeCategory button.sales-category-button')).count()>0);
        expect(element.all(by.css('ion-grid ion-card')).count()>0);
     });

  

});