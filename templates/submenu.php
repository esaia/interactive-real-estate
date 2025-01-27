<?php

echo '<h1>Interactive Real Estate Submenu</h1>';
echo '<p>Welcome to the submenu page!</p>';




if (ire_fs()->is_free_plan()) {
    echo 'free plan';
} else {
    echo 'not free plan';
};

echo '<br/>';



if (ire_fs()->can_use_premium_code()) {
    echo 'Premium access granted.';
} else {
    echo 'No premium access.';
}

echo '<br/>';


if (ire_fs()->is__premium_only()) {
    echo 'This feature is premium-only.';
} else {
    echo 'Free feature.';
}


echo '<br/>';

if (ire_fs()->is_plan('premium', $exact = true)) {
    echo 'premium.';
} else {
    echo 'not premium.';
}


echo '<br/>';

if (ire_fs()->is_plan('gold', $exact = true)) {
    echo 'gold.';
} else {
    echo 'not gold.';
}
