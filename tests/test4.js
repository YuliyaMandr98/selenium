const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

(async function testSauceDemoSorting() {
    // Настройки браузера
    const options = new chrome.Options()
        .addArguments('--start-maximized')
        .addArguments('--disable-infobars');

    // Создаем экземпляр драйвера
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // 1. Открываем сайт
        await driver.get('https://www.saucedemo.com');
        console.log('1. Страница успешно открыта');

        // 2. Вход в систему
        await driver.findElement(By.id('user-name')).sendKeys('standard_user');
        await driver.findElement(By.id('password')).sendKeys('secret_sauce');
        await driver.findElement(By.id('login-button')).click();
        console.log('2. Успешный вход в систему');

        // 3. Проверяем, что мы на странице продуктов
        await driver.wait(until.elementLocated(By.className('inventory_list')), 5000);
        console.log('3. Страница с товарами загружена');

        // 4. Выбираем сортировку по цене (от низкой к высокой)
        const sortDropdown = await driver.findElement(By.className('product_sort_container'));
        await sortDropdown.sendKeys('Price (low to high)');
        console.log('4. Сортировка по цене (от низкой к высокой) выбрана');

        // 5. Получаем все цены товаров
        await delay(1000); // Даем время для применения сортировки
        const priceElements = await driver.findElements(By.className('inventory_item_price'));
        const prices = [];

        for (const element of priceElements) {
            const priceText = await element.getText();
            const price = parseFloat(priceText.replace('$', ''));
            prices.push(price);
            console.log(`Найден товар с ценой: $${price}`);
        }

        // 6. Проверяем, что цены отсортированы правильно
        let isSorted = true;
        for (let i = 0; i < prices.length - 1; i++) {
            if (prices[i] > prices[i + 1]) {
                isSorted = false;
                break;
            }
        }

        assert(isSorted, 'Товары не отсортированы по цене (от низкой к высокой)');
        console.log('5. Проверка сортировки: товары отсортированы правильно');

        console.log('\n=== ТЕСТ УСПЕШНО ЗАВЕРШЕН ===');
    } catch (error) {
        console.error('\n=== ОШИБКА В ТЕСТЕ ===');
        console.error(error);

        // Делаем скриншот при ошибке
        try {
            const image = await driver.takeScreenshot();
            require('fs').writeFileSync('error.png', image, 'base64');
            console.log('Скриншот ошибки сохранен как error.png');
        } catch (e) {
            console.error('Не удалось сделать скриншот:', e);
        }
    } finally {
        // Закрываем браузер
        await driver.quit();
    }

    // Вспомогательная функция для задержки
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
})();