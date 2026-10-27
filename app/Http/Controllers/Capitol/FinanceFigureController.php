<?php

namespace App\Http\Controllers\Capitol;

use App\Actions\RecordFinanceFigure;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFinanceFigureRequest;
use App\Models\Municipality;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

final class FinanceFigureController extends Controller
{
    public function store(StoreFinanceFigureRequest $request, Municipality $town, RecordFinanceFigure $record): RedirectResponse
    {
        $record->handle($request->user(), $town, $request->reportYear(), $request->figure());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Figure saved. It waits for another reviewer to sign it off.']);

        return to_route('capitol.finances.show', ['town' => $town->psgc_code, 'year' => $request->reportYear()]);
    }
}
