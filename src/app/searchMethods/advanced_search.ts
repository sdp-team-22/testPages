export interface AdvancedSearchQuery {
    field: string;
    compound_name: string;
    solventMatch: string;
    solvent_1: string;
    solvent_2: string;
    solvent_3: string;
    xrpdf: string;
}

export function populateSearchQuery(filters: any[]) : string
{
    const searchQuery: AdvancedSearchQuery = {
        field: '',
        compound_name: '',
        solventMatch: '',
        solvent_1: '',
        solvent_2: '',
        solvent_3: '',
        xrpdf: '',
    };

    for (const filter of filters) {
        if (filter.field === 'compound_name') {
            searchQuery.compound_name = filter.compound_name;
        } else if (filter.field === 'solvent') {
            searchQuery.solventMatch = filter.solventMatch;
            searchQuery.solvent_1 = filter.solvent_1;
            searchQuery.solvent_2 = filter.solvent_2;
            searchQuery.solvent_3 = filter.solvent_3;
        } else if (filter.field === 'xrpdf') {
            searchQuery.xrpdf = filter.xrpdf;
        }
    }
    return encodeURIComponent(JSON.stringify(searchQuery));
}