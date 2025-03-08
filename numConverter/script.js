class SignedNBitNumber {
    constructor(value, n_bits) {
        this.n_bits = n_bits;
        this.bits = new Array(n_bits).fill(false);
        this.setValue(value);
    }

    static fromBits(bitsString) {
        // Remove all spaces from the input string
        bitsString = bitsString.replace(/\s/g, '');
        
        // Check if the string contains only 0s and 1s
        if (!/^[01]+$/.test(bitsString)) {
            throw new Error('Invalid binary string. Only 0s and 1s are allowed.');
        }
        
        const n_bits = bitsString.length;
        let value = 0;
        
        // Convert binary string to decimal
        for (let i = 0; i < n_bits; i++) {
            value = (value << 1) | (bitsString[i] === '1' ? 1 : 0);
        }
        
        // Handle two's complement for negative numbers
        if (bitsString[0] === '1') {
            value -= (1 << n_bits);
        }
        
        return new SignedNBitNumber(value, n_bits);
    }    

    setValue(value) {
        const maxValue = Math.pow(2, this.n_bits - 1) - 1;
        const minValue = -Math.pow(2, this.n_bits - 1);

        if (value > maxValue || value < minValue) {
            throw new Error(`Value '${value}' is out of range for ${this.n_bits}-bit signed number`);
        }

        // Handle negative values
        if (value < 0) {
            this.bits[0] = true; // Sign bit
            value = Math.abs(value);
        } else {
            this.bits[0] = false;
        }

        // Convert value to binary representation
        for (let i = this.n_bits - 1; i > 0; i--) {
            this.bits[i] = (value % 2 === 1);
            value = Math.floor(value / 2);
        }
    }

    getValue() {
        let value = 0;
        for (let i = 1; i < this.n_bits; i++) {
            value = (value * 2) + (this.bits[i] ? 1 : 0);
        }
        return this.bits[0] ? -value : value;
    }

    /**
     * Returns a string representation of the number with commas separating
     * every 3 digits. The number is formatted as if it were a decimal value.
     *
     * @returns {string} A formatted string representation of the number.
     */
    toFormattedDecimalString() {
        let value = Math.abs(this.getValue()).toString();
        let result = '';
        for (let i = value.length - 1, j = 0; i >= 0; i--, j++) {
            if (j > 0 && j % 3 === 0) {
                result = ',' + result;
            }
            result = value[i] + result;
        }
        return this.getValue() < 0 ? '-' + result : result;
    }    

    toBinaryString() {
        return this.bits.map(bit => (bit ? '1' : '0')).join('');
    }

    toFormattedBinaryString() {
        return this.toBinaryString().replace(/(.{4})/g, '$1 ').trim();
    }

    toHexString() {
        const binaryString = this.toBinaryString();
        const hexValue = parseInt(binaryString, 2).toString(16).toUpperCase();
        return hexValue.padStart(Math.ceil(this.n_bits / 4), '0');
    }

    toFormattedHexString() {
        return this.toHexString().replace(/(.{2})/g, '$1 ').trim().replace(/,$/, '');
    }

    static add(a, b) {
        let result = a.getValue() + b.getValue();
        const mask = (1 << (a.n_bits - 1)) - 1;
        const signBit = 1 << (a.n_bits - 1);
        
        // Check for overflow and wrap around
        if (result > mask) {
            result -= (1 << a.n_bits);
        } else if (result < -signBit) {
            result += (1 << a.n_bits);
        }
        
        return new SignedNBitNumber(result, a.n_bits);
    }
    
    static subtract(a, b) {
        let result = a.getValue() - b.getValue();
        const mask = (1 << (a.n_bits - 1)) - 1;
        const signBit = 1 << (a.n_bits - 1);
        
        // Check for overflow and wrap around
        if (result > mask) {
            result -= (1 << a.n_bits);
        } else if (result < -signBit) {
            result += (1 << a.n_bits);
        }
        
        return new SignedNBitNumber(result, a.n_bits);
    }
    
    static and(a, b) {
        const resultValue = a.getValue() & b.getValue();
        return new SignedNBitNumber(resultValue, a.n_bits);
    }
    
    static or(a, b) {
        const resultValue = a.getValue() | b.getValue();
        return new SignedNBitNumber(resultValue, a.n_bits);
    }
    
    static xor(a, b) {
        const resultValue = a.getValue() ^ b.getValue();
        return new SignedNBitNumber(resultValue, a.n_bits);
    }    

    static not(a) {
        const resultBits = a.bits.map(bit => !bit);
        // Convert the inverted bits back to a value
        let resultValue = 0;
        for (let i = 1; i < a.n_bits; i++) {
            resultValue = (resultValue * 2) + (resultBits[i] ? 1 : 0);
        }
        // Apply the sign bit
        if (resultBits[0]) {
            resultValue = -resultValue;
        }
        return new SignedNBitNumber(resultValue, a.n_bits);
    }
}

let nBits = 16;


// Error Handling
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    input.classList.add('is-invalid');
    document.getElementById(`${inputId}-error`).textContent = message;
}

function clearError(inputId) {
    const input = document.getElementById(inputId);
    input.classList.remove('is-invalid');
    document.getElementById(`${inputId}-error`).textContent = '';
}

// Conversion Logic
function updateBitSize() {
    const bitSizeInput = document.getElementById('bitSize');
    const newSize = parseInt(bitSizeInput.value);

    if (isNaN(newSize) || newSize < 1 || newSize > 64) {
        showError('bitSize', 'Invalid bit size. Enter a value between 1 and 64.');
        return;
    }

    nBits = newSize;
    clearError('bitSize');
}

function convert(from) {
    const binaryInput = document.getElementById('binary');
    const decimalInput = document.getElementById('decimal');
    const hexadecimalInput = document.getElementById('hexadecimal');

    // Clear errors
    ['binary', 'decimal', 'hexadecimal'].forEach(clearError);

    try {
        let number;

        switch (from) {
            case 'binary':
                number = SignedNBitNumber.fromBits(binaryInput.value);
                break;

            case 'decimal':
                number = new SignedNBitNumber(parseInt(decimalInput.value.replace(/,/g, ''), 10), nBits);
                break;

            case 'hexadecimal':
                number = new SignedNBitNumber(parseInt(hexadecimalInput.value.replace(/\s/g, ''), 16), nBits);
                break;

            default:
                throw new Error('Unknown conversion source');
        }
        
        if (from !== 'binary') {
            binaryInput.value = number.toFormattedBinaryString();
        }
        if (from !== 'decimal') {
            decimalInput.value = number.toFormattedDecimalString();
        }
        if (from !== 'hexadecimal') {
            hexadecimalInput.value = number.toFormattedHexString();
        }        
    } catch (error) {
        showError(from, error.message);
    }
}

function performOperations() {
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');

    clearError('num1');
    clearError('num2');

    let num1, num2;

    try {
        num1 = new SignedNBitNumber(num1Input.value, nBits);
    } catch (error) {
        showError('num1', error.message);
        return;
    }

    try {
        num2 = new SignedNBitNumber(num2Input.value, nBits);
    } catch (error) {
        showError('num2', error.message);
        return;
    }

    document.getElementById('binaryRepresentation').innerHTML =
        `Number 1 (Binary): ${num1.toFormattedBinaryString()}<br>` +
        `Number 2 (Binary): ${num2.toFormattedBinaryString()}`;

    const operationsTableBody =
        document.getElementById('operationsTable').getElementsByTagName('tbody')[0];

    operationsTableBody.innerHTML = ""; // clear existing rows

    // Populate operation rows using SignedNBitNumber
    const operations = [
        { u: 0, op0: 0, op1: 0, name: "X AND Y", func: () => SignedNBitNumber.and(num1, num2) },
        { u: 0, op0: 1, op1: 0, name: "X OR Y", func: () => SignedNBitNumber.or(num1, num2) },
        { u: 0, op0: 0, op1: 1, name: "X XOR Y", func: () => SignedNBitNumber.xor(num1, num2) },
        { u: 0, op0: 1, op1: 1, name: "NOT X", func: () => SignedNBitNumber.not(num1) },
        { u: 1, op0: 0, op1: 0, name: "X PLUS Y", func: () => SignedNBitNumber.add(num1, num2) },
        { u: 1, op0: 1, op1: 0, name: "X PLUS 1", func: () => SignedNBitNumber.add(num1, new SignedNBitNumber(1, nBits)) },
        { u: 1, op0: 0, op1: 1, name: "X MINUS Y", func: () => SignedNBitNumber.subtract(num1, num2) },
        { u: 1, op0: 1, op1: 1, name: "X MINUS 1", func: () => SignedNBitNumber.subtract(num1, new SignedNBitNumber(1, nBits)) }
    ];

    operations.forEach(op => {
        const result = op.func();
        const row = operationsTableBody.insertRow();
        row.insertCell().textContent = op.u;
        row.insertCell().textContent = op.op0;
        row.insertCell().textContent = op.op1;
        row.insertCell().textContent = op.name;
        row.insertCell().textContent = result.toFormattedDecimalString();;
        row.insertCell().textContent = result.toFormattedBinaryString();
        row.insertCell().textContent = result.toFormattedHexString();
    });
}

function to16BitBinary(num) {
    return (num & 0xFFFF).toString(2).padStart(16, '0');
}

function add16Bit(a, b) {
    return (a + b) & 0xFFFF;
}

function sub16Bit(a, b) {
    return (a - b) & 0xFFFF;
}

function parseValueWithUnit(input) {
    const units = {
        'hz': 1,
        'khz': 1000,
        'mhz': 1000000,
        'ghz': 1000000000,
        's': 1,
        'ms': 0.001,
        'us': 0.000001,
        'ns': 0.000000001
    };

    // Remove commas and spaces
    input = input.replace(/,/g, '').replace(/\s/g, '');

    const match = input.toLowerCase().match(/^(\d+(\.\d+)?)\s*([a-z]+)?$/);
    if (!match) {
        throw new Error('Invalid input format');
    }

    const value = parseFloat(match[1]);
    const unit = match[3] || '';

    if (unit && !units[unit]) {
        throw new Error('Unrecognized unit');
    }

    return unit ? value * units[unit] : value;
}

function round(value, precision) {
    return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
}

function formatOutput(value, unit, highPrecision = false) {
    const units = {
        'Hz': ['Hz', 'kHz', 'MHz', 'GHz'],
        's': ['s', 'ms', 'µs', 'ns'],
    };

    const unitGroup = units[unit];
    let index = 0;

    if (unit === 'Hz') {
        while (value >= 900 && index < unitGroup.length - 1) {
            value /= 1000;
            index++;
        }
    } else {
        while (value < 0.9 && index < unitGroup.length - 1) {
            value *= 1000;
            index++;
        }
    }

    if (highPrecision) {
        return `${value} ${unitGroup[index]}`;
    }
    return `${round(value, 2)} ${unitGroup[index]}`;
}

function clearAllFrequencyErrors() {
    const inputs = ['frequency', 'totalCycleTime', 'halfCycleTime', 'adjustedCycleTime'];
    inputs.forEach(clearError);
}

let lastFrequencySource = 'frequency';

function calculateFrequency(source) {
    const frequency = document.getElementById('frequency');
    const totalCycleTime = document.getElementById('totalCycleTime');
    const halfCycleTime = document.getElementById('halfCycleTime');
    const adjustedCycleTime = document.getElementById('adjustedCycleTime');

    const propagationDelay = 40; // 40ns for 6 ICs in series

    const highPrecision = document.getElementById('high-precision').checked;

    try {
        switch (source) {
            case 'frequency': {
                const freq = parseValueWithUnit(frequency.value);
                totalCycleTime.value = formatOutput(1 / freq, 's', highPrecision);
                halfCycleTime.value = formatOutput(1 / (2 * freq), 's', highPrecision);
                adjustedCycleTime.value = formatOutput(1 / freq - propagationDelay * 1e-9, 's', highPrecision);
                break;
            }
            case 'totalCycleTime':
                const total = parseValueWithUnit(totalCycleTime.value);
                frequency.value = formatOutput(1 / total, 'Hz', highPrecision);
                halfCycleTime.value = formatOutput(total / 2, 's', highPrecision);
                adjustedCycleTime.value = formatOutput(total - propagationDelay * 1e-9, 's', highPrecision);
                break;
            case 'halfCycleTime':
                const half = parseValueWithUnit(halfCycleTime.value);
                totalCycleTime.value = formatOutput(half * 2, 's', highPrecision);
                frequency.value = formatOutput(1 / (half * 2), 'Hz', highPrecision);
                adjustedCycleTime.value = formatOutput(half * 2 - propagationDelay * 1e-9, 's', highPrecision);
                break;
            case 'adjustedCycleTime':
                const adjusted = parseValueWithUnit(adjustedCycleTime.value);
                totalCycleTime.value = formatOutput(adjusted + propagationDelay * 1e-9, 's', highPrecision);
                frequency.value = formatOutput(1 / (adjusted + propagationDelay * 1e-9), 'Hz', highPrecision);
                halfCycleTime.value = formatOutput((adjusted - propagationDelay * 1e-9) / 2, 's', highPrecision);
                break;
            case 'high-precision': {
                // const freq = parseValueWithUnit(frequency.value);
                // frequency.value = formatOutput(freq, 'Hz', highPrecision);
                // totalCycleTime.value = formatOutput(1 / freq, 's', highPrecision);
                // halfCycleTime.value = formatOutput(1 / (2 * freq), 's', highPrecision);
                // adjustedCycleTime.value = formatOutput(1 / freq - propagationDelay * 1e-9, 's', highPrecision);

                let freq;
                switch (lastFrequencySource) {
                    case 'frequency':
                        freq = parseValueWithUnit(frequency.value);
                        break;
                    case 'totalCycleTime':
                        freq = 1 / parseValueWithUnit(totalCycleTime.value);
                        break;
                    case 'halfCycleTime':
                        freq = 1 / (2 * parseValueWithUnit(halfCycleTime.value));
                        break;
                    case 'adjustedCycleTime':
                        freq = 1 / (parseValueWithUnit(adjustedCycleTime.value) + propagationDelay * 1e-9);
                        break;
                    default:
                        throw new Error(`Invalid frequency source: ${lastFrequencySource}`);
                }

                if (lastFrequencySource !== 'frequency') {
                    frequency.value = formatOutput(freq, 'Hz', highPrecision);
                }
                if (lastFrequencySource !== 'totalCycleTime') {
                    totalCycleTime.value = formatOutput(1 / freq, 's', highPrecision);
                }
                if (lastFrequencySource !== 'halfCycleTime') {
                    halfCycleTime.value = formatOutput(1 / (2 * freq), 's', highPrecision);
                }
                if (lastFrequencySource !== 'adjustedCycleTime') {
                    adjustedCycleTime.value = formatOutput(1 / freq - propagationDelay * 1e-9, 's', highPrecision);
                }
                break;
            }
        }

        clearAllFrequencyErrors();
    } catch (error) {
        const errorElement = document.getElementById(`${source}-error`);
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
    }

    if (source !== 'high-precision') lastFrequencySource = source;
}

// Initialize the operations table when the page loads
document.addEventListener('DOMContentLoaded', function () {
    performOperations();
});
