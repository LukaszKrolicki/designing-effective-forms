function updatePhoneCodeAndFlag(countryInput) {
  const selectedOption = countryInput.options[countryInput.selectedIndex];
  document.getElementById('phonePrefix').textContent = selectedOption.dataset.phonePrefix;
  document.getElementById('countryFlag').innerHTML = `<img src="${selectedOption.dataset.flag}" width="20">`;
}

document.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.querySelector('[data-bs-target="#form-feedback-modal"]').click();
  }
});

document.getElementById('country').addEventListener('change', function() {
  updatePhoneCodeAndFlag(this);
});

let clickCount = 0;
const clicksInfo = document.getElementById('click-count');

document.addEventListener('click', handleClick);

function handleClick() {
  clickCount++;
  clicksInfo.innerText = clickCount;
}

async function loadCountries() {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const data = await response.json();
    const countrySelect = document.getElementById('country');
    const sortedCountries = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
    sortedCountries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.name.common;
      option.textContent = country.name.common;
      option.dataset.phonePrefix = country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : '');
      option.dataset.flag = country.flags.svg;
      countrySelect.appendChild(option);
    });
    getCountryByIP();
  } catch (error) {
    console.error('Błąd ładowania krajów:', error);
  }
}

function getCountryByIP() {
  fetch('https://get.geojs.io/v1/ip/geo.json')
    .then(response => response.json())
    .then(data => {
      const country = data.country;
      const countryOptions = Array.from(document.getElementById('country').options);
      const matchingOption = countryOptions.find(option => option.value === country);
      if (matchingOption) {
        document.getElementById('country').value = matchingOption.value;
        updatePhoneCodeAndFlag(document.getElementById('country'));
      }
    })
    .catch(error => {
      console.error('Błąd pobierania danych z serwera GeoJS:', error);
    });
}

document.getElementById('paymentMethods').addEventListener('click', function(e) {
  if (e.target.tagName === 'BUTTON') {
    document.querySelectorAll('#paymentMethods button').forEach(btn => btn.classList.remove('btn-primary'));
    e.target.classList.add('btn-primary');
    updateFaktura();
  }
});

function updateFaktura() {
  document.getElementById('fakturaFirstName').textContent = document.getElementById('firstName').value;
  document.getElementById('fakturaCountry').textContent = document.getElementById('country').value;
  document.getElementById('fakturaZipCode').textContent = document.getElementById('zipCode').value;
  document.getElementById('fakturaCity').textContent = document.getElementById('city').value;
  document.getElementById('fakturaStreet').textContent = document.getElementById('street').value;
  document.getElementById('fakturaPhone').textContent = document.getElementById('phonePrefix').textContent + document.getElementById('phone').value;
  document.getElementById('fakturaEmail').textContent = document.getElementById('email').value;
  document.getElementById('fakturaVatNumber').textContent = document.getElementById('vatNumber').value;
  document.getElementById('fakturaShipping').textContent = document.querySelector('input[name="shipping"]:checked')?.value || '';
  document.getElementById('fakturaPayment').textContent = document.querySelector('#paymentMethods .btn-primary')?.dataset.value || '';
  document.getElementById('fakturaVatUE').textContent = document.getElementById('vatUE').checked ? 'Tak' : 'Nie';
}

document.querySelectorAll('#form input, #form select').forEach(input => {
  input.addEventListener('input', updateFaktura);
});

document.querySelectorAll('input[name="shipping"]').forEach(radio => {
  radio.addEventListener('change', updateFaktura);
});

document.getElementById('toggleFaktura').addEventListener('click', function() {
  const fakturaDiv = document.getElementById('faktura');
  if (fakturaDiv.style.display === 'none') {
    fakturaDiv.style.display = 'block';
  } else {
    fakturaDiv.style.display = 'none';
  }
});

function validateFaktura() {
  const requiredFields = [
    'firstName', 'country', 'zipCode', 'city', 'street', 'phone', 'email', 'password', 'vatNumber'
  ];
  let isValid = true;
  let missingFields = [];
  let errors = [];

  requiredFields.forEach(field => {
    const input = document.getElementById(field);
    if (!input || !input.value.trim()) {
      isValid = false;
      missingFields.push(input ? (input.ariaLabel || field) : field);
    } else {
      if (field === 'vatNumber' && !/^[0-9]+$/.test(input.value)) {
        isValid = false;
        errors.push("Numer VAT musi składać się wyłącznie z cyfr.");
      }
      if (field === 'password' && input.value.length < 5) {
        isValid = false;
        errors.push("Hasło musi mieć co najmniej 5 znaków.");
      }
      if (field !== 'password' && field !== 'vatNumber' && input.value.length < 3) {
        isValid = false;
        errors.push(`${input.ariaLabel || field} musi mieć co najmniej 3 znaki.`);
      }
    }
  });

  if (!isValid) {
    let errorMessage = "Proszę uzupełnić brakujące pola: " + missingFields.join(", ");
    if (errors.length > 0) {
      errorMessage += "\n\nDodatkowe błędy:\n" + errors.join("\n");
    }
    alert(errorMessage);
  }

  return isValid;
}

document.getElementById('toggleFaktura').addEventListener('click', function() {
  if (validateFaktura()) {
    const fakturaDiv = document.getElementById('faktura');
    fakturaDiv.style.display = (fakturaDiv.style.display === 'none') ? 'block' : 'none';
  }
});

document.getElementById('form').addEventListener('submit', function(event) {
  if (!validateFaktura()) {
    event.preventDefault();
  }
});

window.onload = function() {
  loadCountries();
  updateFaktura();
};