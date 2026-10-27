<?php

namespace App\Enums;

enum FinanceDocumentKind: string
{
    case ExecutiveSummary = 'executive_summary';
    case FsWorkbook = 'fs_workbook';
}
