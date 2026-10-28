<?php

namespace App\Http\Controllers;

use App\Http\Requests\EconomicPerformanceRequest;
use App\Queries\EconomicPerformanceQuery;
use Inertia\Inertia;
use Inertia\Response;

final class EconomicPerformanceController extends Controller
{
    public function __invoke(EconomicPerformanceRequest $request, EconomicPerformanceQuery $query): Response
    {
        return Inertia::render('public/economic-performance', [
            'performance' => $query->get($request->filters()),
        ]);
    }
}
