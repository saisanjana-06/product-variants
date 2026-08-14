const hasVariants = document.getElementById("hasVariants");
const variantSection = document.getElementById("variantSection");
const optionsContainer = document.getElementById("optionsContainer");
const addOptionBtn = document.getElementById("addOptionBtn");
const variantsContainer = document.getElementById("variantsContainer");

let optionCount = 0;
let variantData = {};
let deletedVariants = [];

hasVariants.addEventListener("change", function () {
    if (hasVariants.checked) {
        variantSection.classList.remove("hidden");

        if (optionsContainer.children.length === 0) {
            addOption();
        }

        generateVariants();
    } else {
        saveVariantData();
        variantSection.classList.add("hidden");
    }
});

addOptionBtn.addEventListener("click", function () {
    saveVariantData();
    addOption();
    generateVariants();
});

function addOption() {
    optionCount++;

    const optionCard = document.createElement("div");
    optionCard.className = "option-card";

    optionCard.innerHTML = `
        <div class="option-header">
            <div class="option-title">Option ${optionCount}</div>
            <button class="remove-option">Remove</button>
        </div>

        <input type="text"
               class="option-name"
               placeholder="Option name">

        <div class="values-box">
            <input type="text"
                   class="value-input"
                   placeholder="Separate options with a comma">
        </div>
    `;

    optionsContainer.appendChild(optionCard);

    const valuesBox = optionCard.querySelector(".values-box");
    const valueInput = optionCard.querySelector(".value-input");
    const removeButton = optionCard.querySelector(".remove-option");

    valueInput.addEventListener("keydown", function (event) {
        if (event.key === "," || event.key === "Enter") {
            event.preventDefault();

            const value = valueInput.value.trim();

            if (value !== "") {
                addValue(value, valuesBox);
            }

            valueInput.value = "";
            saveVariantData();
            generateVariants();
        }
    });

    valueInput.addEventListener("blur", function () {
        const value = valueInput.value.trim();

        if (value !== "") {
            const values = value.split(",");

            values.forEach(function (item) {
                if (item.trim() !== "") {
                    addValue(item.trim(), valuesBox);
                }
            });

            valueInput.value = "";
            saveVariantData();
            generateVariants();
        }
    });

    removeButton.addEventListener("click", function () {
        saveVariantData();
        optionCard.remove();
        generateVariants();
    });

    optionCard.querySelector(".option-name").addEventListener("input", function () {
        saveVariantData();
        generateVariants();
    });
}

function addValue(value, valuesBox) {
    const existingValues = valuesBox.querySelectorAll(".value-chip");

    for (let i = 0; i < existingValues.length; i++) {
        if (existingValues[i].getAttribute("data-value").toLowerCase() === value.toLowerCase()) {
            return;
        }
    }

    const chip = document.createElement("div");
    chip.className = "value-chip";
    chip.setAttribute("data-value", value);

    chip.innerHTML = `
        <span>${value}</span>
        <button class="remove-value">×</button>
    `;

    const input = valuesBox.querySelector(".value-input");

    valuesBox.insertBefore(chip, input);

    chip.querySelector(".remove-value").addEventListener("click", function () {
        saveVariantData();
        chip.remove();
        generateVariants();
    });
}

function getOptions() {
    const optionCards = document.querySelectorAll(".option-card");
    const options = [];

    optionCards.forEach(function (card) {
        const name = card.querySelector(".option-name").value.trim();
        const chips = card.querySelectorAll(".value-chip");
        const values = [];

        chips.forEach(function (chip) {
            const value = chip.getAttribute("data-value");

            if (value !== "" && !values.includes(value)) {
                values.push(value);
            }
        });

        if (name !== "" && values.length > 0) {
            let duplicateName = false;

            options.forEach(function (option) {
                if (option.name.toLowerCase() === name.toLowerCase()) {
                    duplicateName = true;
                }
            });

            if (!duplicateName) {
                options.push({
                    name: name,
                    values: values
                });
            }
        }
    });

    return options;
}

function generateCombinations(options) {
    let combinations = [[]];

    options.forEach(function (option) {
        const newCombinations = [];

        combinations.forEach(function (combination) {
            option.values.forEach(function (value) {
                newCombinations.push(
                    combination.concat(value)
                );
            });
        });

        combinations = newCombinations;
    });

    return combinations;
}

function saveVariantData() {
    const rows = variantsContainer.querySelectorAll("tbody tr");

    rows.forEach(function (row) {
        const name = row.querySelector(".variant-name");

        if (!name) {
            return;
        }

        const variant = name.textContent.trim();

        variantData[variant] = {
            price: row.querySelector(".price").value,
            quantity: row.querySelector(".quantity").value,
            sku: row.querySelector(".sku").value,
            barcode: row.querySelector(".barcode").value
        };
    });
}

function generateVariants() {
    const options = getOptions();

    if (options.length === 0) {
        variantsContainer.innerHTML = `
            <p class="empty-message">
                Add options and values to generate variants.
            </p>
        `;
        return;
    }

    const combinations = generateCombinations(options);

    let html = `
        <table class="variant-table">
            <thead>
                <tr>
                    <th>variant</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>SKU</th>
                    <th>Barcode</th>
                    <th></th>
                </tr>
            </thead>

            <tbody>
    `;

    combinations.forEach(function (combination) {
        const variantName = combination.join(" / ");

        if (deletedVariants.includes(variantName)) {
            return;
        }

        const data = variantData[variantName] || {};

        html += `
            <tr>
                <td class="variant-name">${variantName}</td>

                <td>
                    <input
                        type="number"
                        class="price"
                        min="0"
                        step="0.01"
                        value="${data.price || "0.00"}"
                    >
                </td>

                <td>
                    <input
                        type="number"
                        class="quantity"
                        min="0"
                        step="1"
                        value="${data.quantity || "0"}"
                    >
                </td>

                <td>
                    <input
                        type="text"
                        class="sku"
                        value="${data.sku || ""}"
                    >
                </td>

                <td>
                    <input
                        type="text"
                        class="barcode"
                        value="${data.barcode || ""}"
                    >
                </td>

                <td>
                    <button class="delete-variant">🗑</button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    variantsContainer.innerHTML = html;
}

variantsContainer.addEventListener("input", function (event) {

    if (event.target.classList.contains("price")) {
        if (event.target.value < 0) {
            event.target.value = 0;
        }
    }

    if (event.target.classList.contains("quantity")) {
        if (event.target.value < 0) {
            event.target.value = 0;
        }

        if (event.target.value.includes(".")) {
            event.target.value = Math.floor(event.target.value);
        }
    }

    if (event.target.classList.contains("barcode")) {
        event.target.value = event.target.value.replace(/[^0-9]/g, "");
    }

    saveVariantData();
});

variantsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-variant")) {

        const row = event.target.closest("tr");
        const variant = row.querySelector(".variant-name").textContent.trim();

        saveVariantData();

        if (!deletedVariants.includes(variant)) {
            deletedVariants.push(variant);
        }

        delete variantData[variant];

        row.remove();
    }
});