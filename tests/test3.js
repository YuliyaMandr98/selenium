const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const path = require('path');

// Настройки браузера
const options = new chrome.Options()
    .addArguments('--start-maximized')
    .addArguments('--disable-infobars')
    .addArguments('--disable-notifications');

// Путь к изображению
const testImagePath = 'C:\\YULYA\\TESTING\\selenium\\selenium\\IMG_20250506_152543.jpg';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function safeClick(driver, locator, description, timeout = 10000) {
    try {
        const element = await driver.wait(until.elementLocated(locator), timeout);
        await driver.wait(until.elementIsVisible(element), timeout);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", element);
        await delay(800); // Увеличенная пауза после прокрутки
        await driver.wait(until.elementIsEnabled(element), timeout);
        await element.click();
        console.log(`✅ Элемент "${description}" успешно нажат`);
        return true;
    } catch (error) {
        console.error(`❌ Не удалось кликнуть на элемент "${description}":`, error.message);
        throw error;
    }
}

async function safeSendKeys(driver, locator, value, description, timeout = 10000) {
    try {
        const element = await driver.wait(until.elementLocated(locator), timeout);
        await element.clear();
        await element.sendKeys(value);
        console.log(`✅ Поле "${description}" заполнено: ${value}`);
        return true;
    } catch (error) {
        console.error(`❌ Не удалось заполнить поле "${description}":`, error.message);
        throw error;
    }
}

async function selectReactDropdown(driver, dropdownId, optionText, description) {
    try {
        console.log(`⌛ Выбираем ${description}: ${optionText}`);

        // 1. Находим и активируем dropdown
        const dropdown = await driver.wait(
            until.elementLocated(By.xpath(`//div[@id='${dropdownId}']//div[contains(@class, 'indicatorContainer')]`)),
            15000
        );
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", dropdown);
        await delay(1000);
        await driver.executeScript("arguments[0].click();", dropdown);
        await delay(1500);

        // 2. Вводим текст для поиска (если нужно)
        const input = await driver.findElement(By.css(`#${dropdownId} input`));
        await input.sendKeys(optionText);
        await delay(1000);

        // 3. Ищем и выбираем опцию
        const optionLocator = By.xpath(`//div[contains(@class, 'menu')]//div[contains(text(), '${optionText}')]`);
        const option = await driver.wait(until.elementLocated(optionLocator), 10000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", option);
        await delay(800);
        await option.click();

        console.log(`✅ Успешно выбрано: ${optionText}`);
        return true;
    } catch (error) {
        console.error(`❌ Ошибка при выборе ${description}:`, error.message);

        // Попробуем альтернативный метод
        try {
            console.log('⌛ Пробуем альтернативный метод выбора...');
            await driver.executeScript(`
                const select = document.querySelector('#${dropdownId}');
                const input = select.querySelector('input');
                input.value = '${optionText}';
                const event = new Event('input', { bubbles: true });
                input.dispatchEvent(event);
            `);
            await delay(1500);

            const option = await driver.wait(
                until.elementLocated(By.xpath(`//div[contains(@class, 'menu')]//div[contains(text(), '${optionText}')]`)),
                8000
            );
            await option.click();
            console.log(`✅ Успешно выбрано (альтернативный метод): ${optionText}`);
            return true;
        } catch (fallbackError) {
            console.error('❌ Альтернативный метод также не сработал:', fallbackError.message);
            throw error;
        }
    }
}

async function fillForm(driver, formData) {
    console.log('\n=== ЗАПОЛНЕНИЕ ФОРМЫ ===');

    // Основные поля
    await safeSendKeys(driver, By.id('firstName'), formData.firstName, 'Имя');
    await safeSendKeys(driver, By.id('lastName'), formData.lastName, 'Фамилия');
    await safeSendKeys(driver, By.id('userEmail'), formData.email, 'Email');

    // Пол
    await safeClick(driver, By.xpath(`//label[contains(text(), '${formData.gender}')]`), `Пол: ${formData.gender}`);

    // Номер телефона
    await safeSendKeys(driver, By.id('userNumber'), formData.phone, 'Телефон');

    // Дата рождения
    await safeClick(driver, By.id('dateOfBirthInput'), 'Дата рождения');
    await delay(1000);

    // Месяц
    const monthSelect = await driver.findElement(By.css('.react-datepicker__month-select'));
    await monthSelect.sendKeys(formData.dob.month);

    // Год
    const yearSelect = await driver.findElement(By.css('.react-datepicker__year-select'));
    await yearSelect.sendKeys(formData.dob.year);
    await delay(500);

    // День
    const dayElement = await driver.findElement(
        By.css(`.react-datepicker__day--0${formData.dob.day}:not(.react-datepicker__day--outside-month)`)
    );
    await dayElement.click();

    // Хобби
    for (const hobby of formData.hobbies) {
        await safeClick(driver, By.xpath(`//label[contains(text(), '${hobby}')]`), `Хобби: ${hobby}`);
    }

    // Изображение
    const fileInput = await driver.findElement(By.id('uploadPicture'));
    await fileInput.sendKeys(formData.filePath);
    console.log(`✅ Изображение загружено: ${path.basename(formData.filePath)}`);

    // Адрес
    await safeSendKeys(driver, By.id('currentAddress'), formData.address, 'Адрес');

    // Штат и город
    await selectReactDropdown(driver, 'state', formData.state, 'Штат');
    await delay(1000);
    await selectReactDropdown(driver, 'city', formData.city, 'Город');
    await delay(1000);
}

async function submitAndVerifyForm(driver) {
    console.log('\n=== ОТПРАВКА ФОРМЫ ===');

    // Скролл и клик по кнопке Submit
    const submitBtn = await driver.wait(until.elementLocated(By.id('submit')), 15000);
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", submitBtn);
    await delay(1000);
    await submitBtn.click();
    await delay(3000);

    // Проверка успешной отправки
    try {
        await driver.wait(until.elementLocated(By.id('example-modal-sizes-title-lg')), 10000);
        const modalTitle = await driver.findElement(By.id('example-modal-sizes-title-lg')).getText();
        assert.strictEqual(modalTitle, 'Thanks for submitting the form');
        console.log('✅ Форма успешно отправлена!');

        // Закрываем модальное окно
        await safeClick(driver, By.id('closeLargeModal'), 'Закрытие модального окна');
        return true;
    } catch (error) {
        console.error('❌ Ошибка при проверке отправки формы:', error.message);
        throw error;
    }
}

async function positiveTest(driver) {
    console.log('\n=== ПОЗИТИВНЫЙ СЦЕНАРИЙ ===');

    await driver.get('https://demoqa.com/automation-practice-form');
    await delay(3000); // Увеличенная начальная задержка

    const formData = {
        firstName: 'Юля',
        lastName: 'Иванова',
        email: 'example@example.com',
        gender: 'Male',
        phone: '375295682123',
        dob: { day: '15', month: 'May', year: '1990' },
        hobbies: ['Sports', 'Reading'],
        filePath: testImagePath,
        address: 'Vitebsk',
        state: 'NCR',
        city: 'Delhi'
    };

    await fillForm(driver, formData);
    await submitAndVerifyForm(driver);
}

async function main() {
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        await positiveTest(driver);
        console.log('\n=== ВСЕ ТЕСТЫ УСПЕШНО ЗАВЕРШЕНЫ ===');
    } catch (error) {
        console.error('\n❌ ОШИБКА В ТЕСТЕ:', error.message);

        // Скриншот при ошибке
        try {
            const image = await driver.takeScreenshot();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotPath = `error-${timestamp}.png`;
            require('fs').writeFileSync(screenshotPath, image, 'base64');
            console.log(`📸 Скриншот ошибки сохранен как: ${screenshotPath}`);
        } catch (e) {
            console.error('Не удалось сделать скриншот:', e);
        }
    } finally {
        await driver.quit();
    }
}

main();

// const { Builder, By, Key, until } = require('selenium-webdriver');
// const chrome = require('selenium-webdriver/chrome');

// // Настройки браузера
// const options = new chrome.Options()
//     .addArguments('--start-maximized')
//     .addArguments('--disable-infobars');

// (async function example() {
//     let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
//     try {
//         await driver.get('https://demoqa.com/automation-practice-form');

//         // Заполнение формы
//         await driver.wait(until.elementLocated(By.id('firstName')), 10000).sendKeys('Юля');
//         console.log("Пытаемся взаимодействовать с элементом: firstName");
//         await driver.wait(until.elementLocated(By.id('lastName')), 10000).sendKeys('Иванова');
//         console.log("Пытаемся взаимодействовать с элементом: lastName");
//         await driver.wait(until.elementLocated(By.id('userEmail')), 10000).sendKeys('example@example.com');
//         console.log("Пытаемся взаимодействовать с элементом: email");

//         // Клик по радиокнопке пола
//         await driver.wait(until.elementLocated(By.xpath("//label[contains(text(), 'Male')]")), 10000).click();
//         console.log("Пытаемся взаимодействовать с элементом: gender");

//         await driver.wait(until.elementLocated(By.id('userNumber')), 10000).sendKeys('375295682123');
//         console.log("Пытаемся взаимодействовать с элементом: number");

//         // Выбор даты рождения
//         await driver.wait(until.elementLocated(By.id('dateOfBirthInput')), 10000).click();
//         console.log("Пытаемся взаимодействовать с элементом: calendar");
//         await driver.wait(until.elementLocated(By.xpath('//*[@id="dateOfBirth"]/div[2]/div[2]/div/div/div[2]/div[1]/div[2]/div[2]/select')), 10000).click();
//         console.log("Пытаемся взаимодействовать с элементом: year");
//         await driver.findElement(By.xpath('//*[@id="dateOfBirth"]/div[2]/div[2]/div/div/div[2]/div[1]/div[2]/div[2]/select/option[99]')).click();
//         console.log("Пытаемся взаимодействовать с элементом: month");
//         await driver.findElement(By.xpath('//*[@id="dateOfBirth"]/div[2]/div[2]/div/div/div[2]/div[1]/div[2]/div[1]/select')).click();
//         console.log("Пытаемся взаимодействовать с элементом: day");
//         await driver.findElement(By.xpath('//*[@id="dateOfBirth"]/div[2]/div[2]/div/div/div[2]/div[1]/div[2]/div[1]/select/option[2]')).click();
//         console.log("Пытаемся взаимодействовать с элементом: day2");


//         await driver.findElement(By.xpath('//*[@id="hobbiesWrapper"]/div[2]/div[3]')).click();
//         console.log("Пытаемся взаимодействовать с элементом: hobby");

//         // Прикрепление изображения
//         const fileInput = await driver.wait(until.elementLocated(By.id('uploadPicture')), 10000);
//         const filePath = 'C:\\YULYA\\TESTING\\selenium\\selenium\\IMG_20250506_152543.jpg';
//         await fileInput.sendKeys(filePath);
//         console.log("Пытаемся взаимодействовать с элементом: img");

//         await driver.findElement(By.id('currentAddress')).sendKeys('Vitebsk');
//         console.log("Пытаемся взаимодействовать с элементом: adress");

//         // Отправка формы с помощью JavaScript
//         const element = await driver.wait(until.elementLocated(By.id('submit')), 10000);
//         await driver.executeScript("arguments[0].scrollIntoView();", element);
//         await element.click();
//         console.log("Пытаемся взаимодействовать с элементом: submit");

//         const element2 = await driver.wait(until.elementLocated(By.id('closeLargeModal')), 10000);
//         await driver.executeScript("arguments[0].scrollIntoView();", element2);
//         await element2.click();
//         console.log("УСПЕХ");

//     } finally {
//         // Закрытие драйвера
//         await driver.quit();
//     }
// })();