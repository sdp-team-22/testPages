export interface SolubilityData {
    solvent1: string;
    solvent2: string;
    solvent3: string;
    solv_frac1: number;
    solv_frac2: number;
    solv_frac3: number;
    temp: number;
    xrpd: string;
    solubility: string;
    solute_lot_num: number;
    eln: number;
    measurement_method: string;
    comments: string;
    data_input_status: boolean
}

export const SolubilityDataColumns = [
    {
        key: 'solvent1',
        type: 'text',
        label: 'Solvent 1',
        required: true
    },
    {
        key: 'solvent2',
        type: 'text',
        label: 'Solvent 2',
        required: true
    },
    {
        key: 'solvent3',
        type: 'text',
        label: 'Solvent 3',
        required: true
    },
    {
        key: 'solv_frac1',
        type: 'text',
        label: 'Solv Frac 1 (solute-free)',
        required: true
    },
    {
        key: 'solv_frac2',
        type: 'text',
        label: 'Solv Frac 2 (solute-free)',
        required: true
    },
    {
        key: 'solv_frac3',
        type: 'text',
        label: 'Solv Frac 3 (solute-free)',
        required: true
    },
    {
        key: 'temp',
        type: 'text',
        label: 'Temp'
    },
    {
        key: 'xrpd',
        type: 'text',
        label: 'XRPD',
        required: true
    },
    {
        key: 'solubility',
        type: 'text',
        label: 'Solubility',
        required: true
    },
    {
        key: 'solute_lot_num',
        type: 'text',
        label: 'Solute Lot #',
        required: true
    },
    {
        key: 'eln',
        type: 'text',
        label: 'ELN/Sample % of Measurement',
        required: true
    },
    {
        key: 'measurement_method',
        type: 'text',
        label: 'Measurement Method',
        required: true
    },
    {
        key: 'comments',
        type: 'text',
        label: 'Comments',
        required: true
    },
    {
        key: 'data_input_status',
        type: 'text',
        label: 'Data Input Status',
        required: true
    }
];