<?php

namespace App\Http\Controllers\Capitol;

use App\Actions\CreateFocusTag;
use App\Actions\UpdateBusinessTypeTags;
use App\Http\Controllers\Controller;
use App\Http\Requests\BusinessCategoriesRequest;
use App\Http\Requests\StoreFocusTagRequest;
use App\Http\Requests\UpdateBusinessTypeTagsRequest;
use App\Models\BusinessType;
use App\Queries\BusinessCategoriesQuery;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class BusinessCategoryController extends Controller
{
    public function index(BusinessCategoriesRequest $request, BusinessCategoriesQuery $query): Response
    {
        return Inertia::render('capitol/business-categories', ['categories' => $query->get($request->input('tag'))]);
    }

    public function storeTag(StoreFocusTagRequest $request, CreateFocusTag $create): RedirectResponse
    {
        $tag = $create->handle($request->user(), $request->string('name')->toString());
        Inertia::flash('toast', ['type' => 'success', 'message' => "{$tag->name} added."]);

        return to_route('capitol.categories.index');
    }

    public function updateTags(UpdateBusinessTypeTagsRequest $request, BusinessType $type, UpdateBusinessTypeTags $update): RedirectResponse
    {
        $update->handle($request->user(), $type, $request->tagCodes());
        Inertia::flash('toast', ['type' => 'success', 'message' => "Focus Tags for {$type->name} saved."]);

        return to_route('capitol.categories.index');
    }
}
