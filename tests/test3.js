const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Настройки браузера
const options = new chrome.Options()
    .addArguments('--start-maximized')
    .addArguments('--disable-infobars');

(async function example() {
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    try {
        await driver.get('https://demoqa.com/automation-practice-form');

        // Заполнение формы
        await driver.wait(until.elementLocated(By.id('firstName')), 10000).sendKeys('Юля');
        console.log("Пытаемся взаимодействовать с элементом: firstName");
        await driver.wait(until.elementLocated(By.id('lastName')), 10000).sendKeys('Иванова');
        console.log("Пытаемся взаимодействовать с элементом: lastName");
        await driver.wait(until.elementLocated(By.id('userEmail')), 10000).sendKeys('example@example.com');
        console.log("Пытаемся взаимодействовать с элементом: email");

        // Клик по радиокнопке пола
        await driver.wait(until.elementLocated(By.xpath("//label[contains(text(), 'Male')]")), 10000).click();
        console.log("Пытаемся взаимодействовать с элементом: gender");

        await driver.wait(until.elementLocated(By.id('userNumber')), 10000).sendKeys('375295682123');
        console.log("Пытаемся взаимодействовать с элементом: number");

        // Выбор даты рождения
        await driver.wait(until.elementLocated(By.id('dateOfBirthInput')), 10000).click();
        console.log("Пытаемся взаимодействовать с элементом: calendar");
        await driver.wait(until.elementLocated(By.xpath('//*[@id="dateOfBirth"]/div[2]/div[2]/div/div/div[2]/div[1]/div[2]/div[2]/select')), 10000).click();
        console.log("Пытаемся взаимодействовать с элементом: year");
        await driver.findElement(By.xpath('//*[@id="dateOfBirth"]/div[2]/div[2]/div/div/div[2]/div[1]/div[2]/div[2]/select/option[99]')).click();
        console.log("Пытаемся взаимодействовать с элементом: month");
        await driver.findElement(By.xpath('//*[@id="dateOfBirth"]/div[2]/div[2]/div/div/div[2]/div[1]/div[2]/div[1]/select')).click();
        console.log("Пытаемся взаимодействовать с элементом: day");
        await driver.findElement(By.xpath('//*[@id="dateOfBirth"]/div[2]/div[2]/div/div/div[2]/div[1]/div[2]/div[1]/select/option[2]')).click();
        console.log("Пытаемся взаимодействовать с элементом: day2");

        // await driver.wait(until.elementLocated(By.id('subjectsContainer')), 10000).sendKeys('jgfgfghfhs');
        // console.log("Пытаемся взаимодействовать с элементом: js");

        await driver.findElement(By.xpath('//*[@id="hobbiesWrapper"]/div[2]/div[3]')).click();
        console.log("Пытаемся взаимодействовать с элементом: hobby");

        // Прикрепление изображения
        const fileInput = await driver.wait(until.elementLocated(By.id('uploadPicture')), 10000);
        const filePath = 'C:\\YULYA\\TESTING\\selenium\\selenium\\IMG_20250506_152543.jpg'; // Укажите полный путь к изображению
        await fileInput.sendKeys(filePath);
        console.log("Пытаемся взаимодействовать с элементом: img");

        await driver.findElement(By.id('currentAddress')).sendKeys('Vitebsk');
        console.log("Пытаемся взаимодействовать с элементом: adress");

        // await driver.wait(until.elementLocated(By.xpath('//*[@id="state"]/div/div[2]/div/svg')), 10000).click();
        // console.log("Пытаемся взаимодействовать с элементом: state");
        // await driver.findElement(By.xpath('//*[@id="stateCity-wrapper"]/div[3]')).click();
        // console.log("Пытаемся взаимодействовать с элементом: state2");

        // Отправка формы с помощью JavaScript
        const element = await driver.wait(until.elementLocated(By.id('submit')), 10000);
        await driver.executeScript("arguments[0].scrollIntoView();", element);
        await element.click();
        console.log("Пытаемся взаимодействовать с элементом: submit");

        const element2 = await driver.wait(until.elementLocated(By.id('closeLargeModal')), 10000);
        await driver.executeScript("arguments[0].scrollIntoView();", element2);
        await element2.click();
        console.log("УСПЕХ");

    } finally {
        // Закрытие драйвера
        await driver.quit();
    }
})();



// const { Builder, By, Key, until } = require('selenium-webdriver');
// const chrome = require('selenium-webdriver/chrome');
// const path = require('path');

// // Настройки браузера
// const options = new chrome.Options()
//     .addArguments('--start-maximized')
//     .addArguments('--disable-infobars');



// (async function example() {
//     // Создание экземпляра веб-драйвера
//     let driver = await new Builder().forBrowser('chrome').build();
//     try {
//         // Заход на сайт
//         await driver.get('https://demoqa.com/automation-practice-form'); // Замените на нужный URL

//         // Заполнение формы
//         await driver.findElement(By.id('firstName')).sendKeys('Ваше Имя'); // Измените на актуальное имя поля
//         await driver.findElement(By.id('lastName')).sendKeys('Ваша Фамилия');
//         await driver.findElement(By.id('userEmail')).sendKeys('example@example.com'); // Измените на актуальное имя поля
//         await driver.findElement(By.className('custom-control-label')).click(); // Измените на актуальное имя поля
//         await driver.findElement(By.id('userNumber')).sendKeys('375295682123');
//         await driver.findElement(By.id('dateOfBirthInput')).click();
//         await driver.findElement(By.xpath('//*[@id="dateOfBirth"]/div[2]/div[2]/div/div/div[2]/div[1]/div[2]/div[2]/select')).click();
//         await driver.findElement(By.xpath('//*[@id="dateOfBirth"]/div[2]/div[2]/div/div/div[2]/div[1]/div[2]/div[2]/select/option[99]')).click();
//         await driver.findElement(By.xpath('//*[@id="dateOfBirth"]/div[2]/div[2]/div/div/div[2]/div[1]/div[2]/div[1]/select')).click();
//         await driver.findElement(By.xpath('//*[@id="dateOfBirth"]/div[2]/div[2]/div/div/div[2]/div[1]/div[2]/div[1]/select/option[2]')).click();
//         await driver.findElement(By.xpath('//*[@id="dateOfBirth"]/div[2]/div[2]/div/div/div[2]/div[2]/div[2]/div[3]')).click();
//         await driver.findElement(By.xpath('//*[@id="subjectsContainer"]/div/div[1]')).sendKeys('JS');
//         await driver.findElement(By.className('custom-control-label')).click();


//         // Прикрепление изображения
//         await driver.findElement(By.id('uploadPicture')).sendKeys('selenium\IMG_20250506_152543.jpg'); // Укажите путь к изображению

//         await driver.findElement(By.className('form-control')).sendKeys('Vitebsk');
//         await driver.findElement(By.className(' css-1hwfws3')).click();
//         await driver.findElement(By.xpath('//*[@id="stateCity-wrapper"]/div[3]')).click();

//         // Отправка формы с помощью JavaScript
//         const submitButton = await driver.findElement(By.id('submit')); // Измените на актуальное имя кнопки
//         await driver.executeScript("arguments[0].click();", submitButton);

//         // Ожидание завершения отправки (например, загрузка новой страницы)
//         await driver.wait(until.titleIs('Title of New Page'), 5000); // Замените на заголовок новой страницы

//     } finally {
//         // Закрытие драйвера
//         await driver.quit();
//     }
// })();