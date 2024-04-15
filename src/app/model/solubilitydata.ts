export interface SolubilityData {
    // Update properties to match the JSON structure
    'Solvent 1': string;
    'Solvent 2': string;
    'Solvent 3': string;
    'SolvFrac1_volfrac': number;
    'SolvFrac2_volfrac': number;
    'SolvFrac3_volfrac': number;
    'Temp': number;
    'XRPD': string;
    'mg/mL solv.': number;
    'mg/g solv.': number;
    'mg/g soln.': number;
    'wt%': number;
    'Solute Lot Number': string;
    'ELN/Sample Number of Measurements': string;
    'Measurement Method': string;
    'Comments': string;
}

export const SolubilityDataColumns = [
    {
        key: 'Solvent 1',
        type: 'text',
        label: 'Solvent 1',
        required: true
    },
    {
        key: 'Solvent 2',
        type: 'text',
        label: 'Solvent 2',
        required: true
    },
    {
        key: 'Solvent 3',
        type: 'text',
        label: 'Solvent 3',
        required: true
    },
    {
        key: 'SolvFrac1_volfrac',
        type: 'text',
        label: 'Solv Frac 1 (solute-free)',
        required: true
    },
    {
        key: 'SolvFrac2_volfrac',
        type: 'text',
        label: 'Solv Frac 2 (solute-free)',
        required: true
    },
    {
        key: 'SolvFrac3_volfrac',
        type: 'text',
        label: 'Solv Frac 3 (solute-free)',
        required: true
    },
    {
        key: 'Temp',
        type: 'text',
        label: 'Temp'
    },
    {
        key: 'XRPD',
        type: 'text',
        label: 'XRPD',
        required: true
    },
    {
        key: 'mg/mL solv.',
        type: 'text',
        label: 'mg/mL solv.',
        required: true
    },
    {
        key: 'mg/g solv.',
        type: 'text',
        label: 'mg/g solv.',
        required: true
    },
    {
        key: 'mg/g soln.',
        type: 'text',
        label: 'mg/g soln.',
        required: true
    },
    {
        key: 'wt%',
        type: 'text',
        label: 'wt%',
        required: true
    },
    {
        key: 'Solute Lot Number',
        type: 'text',
        label: 'Solute Lot #',
        required: true
    },
    {
        key: 'ELN/Sample Number of Measurements',
        type: 'text',
        label: 'ELN/Sample % of Measurement',
        required: true
    },
    {
        key: 'Measurement Method',
        type: 'text',
        label: 'Measurement Method',
        required: true
    },
    {
        key: 'Comments',
        type: 'text',
        label: 'Comments',
        required: true
    }
];