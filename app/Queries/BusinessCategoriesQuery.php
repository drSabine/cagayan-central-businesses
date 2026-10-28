<?php

namespace App\Queries;

use App\Data\BusinessCategories;
use App\Data\BusinessCategoryRow;
use App\Data\SelectOption;
use App\Models\BusinessType;
use App\Models\FocusTag;

final class BusinessCategoriesQuery
{
    public function get(?string $tag): BusinessCategories
    {
        return new BusinessCategories(
            types: array_values(BusinessType::query()->with('focusTags:id,code')->orderBy('sort_order')->get()
                ->map(fn (BusinessType $type) => new BusinessCategoryRow(
                    $type->code, $type->name, $type->psic_section_name,
                    array_values($type->focusTags->pluck('code')->all()),
                ))->all()),
            tags: array_values(FocusTag::query()->orderBy('sort_order')->orderBy('name')->get(['code', 'name'])
                ->map(fn (FocusTag $focusTag) => new SelectOption($focusTag->code, $focusTag->name))->all()),
            tag: $tag,
            tagNameMax: (int) config('cagayan.inputs.focus_tag_name_max'),
        );
    }
}
