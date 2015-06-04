##Getting Started With MesdAsyncBundle

The Async bundle allows for dead simple entity creation, updating, and
searching using asynchronous calls. Entity Creation and Updating can be
triggered by simply adding html data attributes to your input elements.

### Prerequisites

Symfony 2.3+


### Installation


#### Step 1: Download MesdAsyncBundle using composer

Add the MesdAsyncBundle to your composer.json file. You'll need to add the
github url under your "repositories" section, and add the bundle to your
"require" section. Make sure not to overwrite any existing repositories or
requirements you already have in place:

``` json
"repositories": [
    // ...
    {
        "type" : "vcs",
        "url" : "https://github.com/MESD/AsyncBundle.git"
    }
],
"require": {
    // ...
        "mesd/async-bundle": "dev-master"
    },
```

Now install the bundle with composer:

``` bash
$ composer update mesd/async-bundle
```

Composer will install the bundle to your project's `vendor/Mesd` directory.


#### Step 2: Enable the bundle

Enable the bundle in the kernel:

``` php
// app/AppKernel.php

public function registerBundles()
{
    $bundles = array(
        // ...
        new Mesd\AsyncBundle\MesdAsyncBundle(),
    );
}
```

#### Step 3: Configure Assetic

Add bundle to Assetic Config:


``` yaml
# app/config/config.yml

# Assetic Configuration
assetic:
    # ...
    bundles:
        # ...
        - MesdAsyncBundle
```


### Using the Async Bundle

#### Step 1: Include the javascript library in your template

Add the javascript library to any twig template (or parent template) you need
async functionality within. Make sure to set the javascirpt variable
`MesdAsyncPath` to the base route of the async controller. This variable is
used to create the url for all async calls via javascript. The bundle includes
a base named route for `MesdAsyncBundle` this purpose:

```twig

{% block javascripts %}

    {{ parent() }}

    <script>
        var MesdAsyncPath = '{{ path('MesdAsyncBundle') }}';
    </script>

    {% javascripts '@MesdAsyncBundle/Resources/public/js/async.js'  %}
        <script src="{{ asset_url }}"></script>
    {% endjavascripts %}


{% endblock javascripts %}
```

#### Step 2: Add html data attributes to your elements:

##### Asynchronous Update

To enable asynchronous update on your element, you need to do the following:

1. Add the class `mesd-async` to the element
2. Add the attribute `data-async-ajax-type` and set it to `update`
3. Add the attribute `data-async-ajax-entity` and set it to the `BundleName:EntityName` you wish to update
4. Add the attribute `data-async-ajax-column` and set it to the entity `ColumnName` you wish to update
5. Add the attribute `data-async-ajax-entity-id` and set it to the entity `id` you wish to update


```html
<input
    type="text"
    class="mesd-async"
    name="example-async-update"
    value="Thing 22"
    data-async-ajax-type="update"
    data-async-ajax-entity="DemoTestBundle:Widget"
    data-async-ajax-column="name"
    data-async-ajax-entity-id="4"
>
```

##### Asynchronous Creation

To enable asynchronous creation on your element, you need to do the following:

1. Add the class `mesd-async` to the element
2. Add the attribute `data-async-ajax-type` and set it to `add`
3. Add the attribute `data-async-ajax-entity` and set it to the `BundleName:EntityName` you wish to create
4. Add the attribute `data-async-ajax-column` and set it to the entity `ColumnName` you wish the value to be placed in

```html
<input
    type="text"
    class="mesd-async"
    name="example-async-insert"
    data-async-ajax-type="add"
    data-async-ajax-entity="DemoTestBundle:Widget"
    data-async-ajax-column="name"
>
```

##### Asynchronous Creation with additional entity data

To enable asynchronous creation on your element, with support for additional
data to be created with the new entity, add the following attribute:

```html
data-async-ajax-data="column1Name+column1Data;column2Name+column2Data"
```

Notice that you can specify entity field/value pairs by separating the elements
with a plus sign `+`. You can also specify multiple pairs, by separating with
them with a semicolon `;`.


```html
<input
    type="text"
    class="mesd-async"
    name="example-async-insert-with-data"
    data-async-ajax-type="add"
    data-async-ajax-entity="DemoTestBundle:Widget"
    data-async-ajax-column="name"
    data-async-ajax-data="description+new item;other_description+other item"
>
```

##### Asynchronous Creation with conversion to Asynchronous Update

If you need your element to convert from creation to update mode, after the
entity has been created, add the following attribute:

```html
data-async-ajax-convert="true"
```

The entityID will automatically be set on the element after successful
creation.


```html
<input
    type="text"
    class="mesd-async"
    name="example-async-insert-convert"
    data-async-ajax-type="add"
    data-async-ajax-convert="true"
    data-async-ajax-entity="DemoTestBundle:Widget"
    data-async-ajax-column="name"
>
```


##### Custom Asynchronous actions

If you need something beyond the standard entity creation or update, you can
call a custom class and method name, passing the value of the input and any
additional data you may need. You need to do the following:

1. Add the class `mesd-async` to the element
2. Add the attribute `data-async-ajax-type` and set it to `custom`
3. Add the attribute `data-async-ajax-class` and set it to the class name and location, using double underscores `__` as directory separators.
4. Add the attribute `data-async-ajax-method` and set it to the class method you want to be called.
5. Add the attribute `data-async-ajax-data` and set any additional data you would like passed to your method as an array. Use a plus sign `+` between keys and values, and a semicolon `;` between the pairs.
6. Optionally, add the attribute `data-async-ajax-manager` and set it to true if you would like the EntityManager passed to the constructor of your class.


```html
<input
    type="text"
    class="mesd-async"
    name="exampleAsyncCustom"
    data-async-ajax-type="custom"
    data-async-ajax-class="Demo__TestBundle__Model__WidgetManager"
    data-async-ajax-method="updateWidget"
    data-async-ajax-data="id+4;description+my widget"
    data-async-ajax-manager="true"
>
```

##### Numeric Formating

You can tell the async processor to treat your values as numeric if
necessary. Add one of the following to your element:

**Integer Values**

```html
    data-async-format="integer"
```

**Decimal Values**
```html
    data-async-format="float"
```

