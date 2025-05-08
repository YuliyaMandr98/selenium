const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

// Настройки браузера
const options = new chrome.Options()
    .addArguments('--start-maximized')
    .addArguments('--disable-infobars')
    .addArguments('--disable-extensions')
    .addArguments('--lang=en-US'); // Устанавливаем английский язык

// Функция для задержки
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async function steamTest() {
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // 1. Открываем домашнюю страницу Steam
        await driver.get('https://store.steampowered.com');
        console.log('1. Домашняя страница Steam загружена');
        await delay(5000); // Увеличили задержку для полной загрузки

        // Обработка cookie-баннера (новый код)
        try {
            const cookieBanner = await driver.wait(
                until.elementLocated(By.id('cookiePrefPopup')),
                5000
            );
            const acceptBtn = await cookieBanner.findElement(By.id('acceptAllButton'));
            await acceptBtn.click();
            console.log(' - Cookie-баннер закрыт');
            await delay(2000);
        } catch (e) {
            console.log(' - Cookie-баннер не обнаружен');
        }

        // Обработка возрастного ограничения
        try {
            const ageSelect = await driver.wait(until.elementLocated(By.id('ageYear')), 3000);
            await ageSelect.click();
            await ageSelect.sendKeys('1990');
            const enterBtn = await driver.findElement(By.id('view_product_page_btn'));
            await enterBtn.click();
            console.log(' - Возрастное ограничение пройдено');
            await delay(2000);
        } catch (e) {
            console.log(' - Возрастное ограничение не обнаружено');
        }

        // 2. Находим и нажимаем кнопку "About" (улучшенный локатор)
        try {
            const aboutLink = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="global_header"]/div/div[2]/a[3]')),
                10000 // Увеличили время ожидания
            );
            await driver.executeScript("arguments[0].scrollIntoView({block: 'center'})", aboutLink);
            await delay(1000);
            await aboutLink.click();
            console.log('2. Кнопка "About" нажата');
            await delay(5000); // Даем время для загрузки страницы
        } catch (error) {
            console.error('Не удалось найти кнопку "About":', error);
            throw error;
        }

        // 3. Проверяем, что попали на нужную страницу
        const currentUrl = await driver.getCurrentUrl();
        assert(currentUrl.includes('about'), 'Не удалось перейти на страницу About');
        console.log('3. Проверка URL: успешно на странице About');


    } catch (error) {
        console.error('Тест не пройден:', error.message);
        // Делаем скриншот при ошибке
        const image = await driver.takeScreenshot();
        require('fs').writeFileSync('error.png', image, 'base64');
        console.log('Скриншот ошибки сохранен как error.png');
        process.exit(1); // Завершаем процесс с ошибкой
    } finally {
        await driver.quit();
    }
})();