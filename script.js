let clickCount = 0;

const countryInput = document.getElementById('country');
const countrySuggestions = document.getElementById('countrySuggestions');
const myForm = document.getElementById('form');
const modal = document.getElementById('form-feedback-modal');
const clicksInfo = document.getElementById('click-count');

function handleClick() {
    clickCount++;
    clicksInfo.innerText = clickCount;
}

async function fetchAndFillCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error('Błąd pobierania danych');
        }
        const data = await response.json();
        const countries = data.map(country => country.name.common);
        const countryList = countries.map(country => `<option value="${country}">${country}</option>`).join('');
        countryInput.setAttribute('list', 'countryOptions');
        const datalist = document.createElement('datalist');
        datalist.id = 'countryOptions';
        datalist.innerHTML = countryList;
        document.body.appendChild(datalist);

        countryInput.addEventListener('input', () => {
            const value = countryInput.value.toLowerCase();
            const suggestions = countries.filter(country => country.toLowerCase().startsWith(value));
            countrySuggestions.innerHTML = suggestions.map(suggestion => `<button type="button" class="list-group-item list-group-item-action">${suggestion}</button>`).join('');
        });

        countrySuggestions.addEventListener('click', (event) => {
            countryInput.value = event.target.textContent;
            countrySuggestions.innerHTML = '';
            getCountryCode(event.target.textContent);
        });

    } catch (error) {
        console.error('Wystąpił błąd:', error);
    }
}

function getCountryByIP() {
    fetch('https://get.geojs.io/v1/ip/geo.json')
        .then(response => response.json())
        .then(data => {
            const country = data.country;
            countryInput.value = country;
            getCountryCode(country);
        })
        .catch(error => {
            console.error('Błąd pobierania danych z serwera GeoJS:', error);
        });
}

function getCountryCode(countryName) {
    const apiUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Błąd pobierania danych');
            }
            return response.json();
        })
        .then(data => {
            const countryCode = data[0].idd.root + data[0].idd.suffixes.join("");
            const countryCodeElem = document.getElementById("countryCode");
            countryCodeElem.value = countryCode;
            const vatCode = data[0].cca2;
            const europeanCountry = data[0].region;
            const vatUE = document.getElementById("vatUE");
            if (europeanCountry == "Europe") {
                vatUE.checked = true;
            } else {
                vatUE.checked = false;
            }
            const vatNumberInput = document.getElementById('vatNumber');
            if (vatNumberInput) {
                vatNumberInput.value = vatCode;
            } else {
                console.error('Element o id "vatNumber" nie istnieje');
            }
        })
        .catch(error => {
            console.error('Wystąpił błąd:', error);
        });
}

// Funkcja do aktualizacji danych w polu "Dane do faktury"
function fillInvoiceData() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('exampleInputEmail1').value;
    const city = document.getElementById('city').value;
    const zipCode = document.getElementById('zipCode').value;

    const invoiceData = `Imię: ${firstName}\nNazwisko: ${lastName}\nEmail: ${email}\nMiasto: ${city}\nKod pocztowy: ${zipCode}`;

    const invoiceDataTextarea = document.getElementById('invoiceData');
    if (invoiceDataTextarea) {
        invoiceDataTextarea.value = invoiceData;
    } else {
        console.error('Element o id "invoiceData" nie istnieje');
    }
}

document.getElementById('country').addEventListener('change', (event) => {
    getCountryCode(event.target.value);
});

document.getElementById('firstName').addEventListener('change', fillInvoiceData);
document.getElementById('lastName').addEventListener('change', fillInvoiceData);
document.getElementById('exampleInputEmail1').addEventListener('change', fillInvoiceData);
document.getElementById('city').addEventListener('change', fillInvoiceData);
document.getElementById('zipCode').addEventListener('change', fillInvoiceData);

(() => {
    document.addEventListener('click', handleClick);
    fetchAndFillCountries();
    getCountryByIP();
})();
