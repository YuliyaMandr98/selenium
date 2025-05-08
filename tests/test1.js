const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { Options } = require('selenium-webdriver/chrome');
const fs = require('fs');

// Функция для человекообразных задержек (разброс от 2 до 5 секунд)
async function humanDelay() {
    const delay = Math.floor(Math.random() * 3000) + 2000; // 2-5 секунд
    await new Promise(resolve => setTimeout(resolve, delay));
}

(async function example() {
    // Настройки Chrome для уменьшения обнаружения автоматизации
    let options = new Options()
        .addArguments('--start-maximized')
        .addArguments('--disable-infobars')
        .addArguments('--disable-extensions')
        .addArguments('--no-sandbox')
        .addArguments('--disable-dev-shm-usage')
        .addArguments('--disable-blink-features=AutomationControlled')
        .addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
        .excludeSwitches('enable-automation');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // Открываем страницу с задержкой
        await driver.get('https://www.google.com/ncr'); // ncr - отключает региональное перенаправление
        console.log('Страница загружена');
        await humanDelay();

        // Пробуем найти и закрыть cookie-баннер (если есть)
        try {
            const acceptButton = await driver.wait(
                until.elementLocated(By.xpath('//button[contains(., "Принять все") or contains(., "Accept all")]')),
                3000
            );
            await acceptButton.click();
            console.log('Cookie-баннер закрыт');
            await humanDelay(); // Даём время на исчезновение баннера
        } catch (e) {
            console.log('Cookie-баннер не найден, продолжаем');
        }

        // Поиск поля ввода с несколькими попытками
        let searchBox;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                // Пробуем разные локаторы для поля поиска
                try {
                    searchBox = await driver.wait(until.elementLocated(By.name('q')), 5000);
                } catch {
                    searchBox = await driver.wait(until.elementLocated(By.css('textarea[type="search"], input[type="text"]')), 5000);
                }

                // Проверяем видимость и кликабельность
                await driver.wait(until.elementIsVisible(searchBox), 3000);
                await driver.wait(until.elementIsEnabled(searchBox), 3000);

                // Прокручиваем к элементу
                await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", searchBox);
                await humanDelay();

                // Очищаем поле
                await searchBox.clear();
                await humanDelay();

                // Кликаем перед вводом
                await searchBox.click();
                await humanDelay();

                // Вводим текст с человеческой скоростью
                const text = 'Selenium WebDriver';
                for (let char of text) {
                    await searchBox.sendKeys(char);
                    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100)); // 100-200ms между символами
                }
                console.log('Текст успешно введён');
                await humanDelay();
                break;
            } catch (error) {
                attempts++;
                console.log(`Попытка ${attempts} из ${maxAttempts} не удалась`);
                if (attempts >= maxAttempts) throw error;
                await humanDelay();
            }
        }

        // Отправка формы с задержкой
        await searchBox.submit();
        console.log('Форма отправлена');
        await humanDelay();

        // Ожидание результатов
        await driver.wait(until.titleContains('Selenium WebDriver'), 10000);
        console.log('Заголовок страницы содержит искомый текст');
        await humanDelay();

        // Скриншот результата
        await takeScreenshot(driver, 'result.png');
        console.log('Тест успешно выполнен!');

    } catch (error) {
        console.error('Ошибка:', error);
        await takeScreenshot(driver, 'error.png');
        console.log('Скриншот ошибки сохранён');

        // Проверяем наличие CAPTCHA
        try {
            const captchaFrame = await driver.wait(until.elementLocated(By.css('iframe[src*="recaptcha"]')), 3000);
            console.warn('Обнаружена CAPTCHA! Это может быть причиной ошибки.');
        } catch (e) {
            console.log('CAPTCHA не обнаружена');
        }
    } finally {
        await driver.quit();
    }
})();

async function takeScreenshot(driver, filename) {
    const image = await driver.takeScreenshot();
    fs.writeFileSync(filename, image, 'base64');
}