<?php

namespace App\Http\Controllers\Capitol;

use App\Http\Controllers\Controller;
use App\Http\Requests\CapitolDashboardRequest;
use App\Queries\WorkspaceMapQuery;
use Inertia\Inertia;
use Inertia\Response;

final class DashboardController extends Controller
{
    public function __invoke(CapitolDashboardRequest $request, WorkspaceMapQuery $query): Response
    {
        return Inertia::render('capitol/dashboard', [
            'map' => $query->get($request->input('town'), $request->input('level') === 'barangays'),
        ]);
    }
}
