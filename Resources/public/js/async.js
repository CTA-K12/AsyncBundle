/**
 *  This script requires that your html template create a js variable named
 *  MesdAsyncPath with the base url for all async calls. You can do this in
 *  twig using the path() function on the MesdAsyncBundle route like so:
 *
 *    <script>
 *        var MesdAsyncBundle = {{ path(MesdAsyncBundle) }}
 *    </script>
 *
 */

$(document).ready(function() {

    /**
     *  When user changes an async field, save the change via ajax call.
     */
    $('body').on('change', '.mesd-async', function() {

        var input         = $(this);
        var value         = input.val();

        /**
         *  Format numeric types for async processing by striping any special
         *  characters and converting to requested type.
         */
        if ("integer" == input.attr('data-async-format')) {

            // Strip any spaces
            value = value.replace(/\s/g, '');

            // Convert null and empty strings to zero
            if (null == value || '' == value) {
                value = 0;
            }

            // Convert value to integer
            value = convertToInteger(value);
        }
        else if ("float" == input.attr('data-async-format')) {

            // Strip any spaces
            value = value.replace(/\s/g, '');

            // Convert null and empty strings to zero
            if (null == value || '' == value) {
                value = 0;
            }

            // Convert value to float
            value = convertToFloat(value);
        }



        // Get async data from data attributes and build ajax url
        var ajaxType = input.attr('data-async-ajax-type');

        if ('update' == ajaxType ) {
            var entity   = input.attr('data-async-ajax-entity');
            var column   = input.attr('data-async-ajax-column');
            var entityId = input.attr('data-async-ajax-entity-id');

            var asyncUrl =
                MesdAsyncPath + 'update/' + entity + '/' + column + '/' + entityId + '/' + value;
        }
        else if ('add' == ajaxType ) {
            var entity     = input.attr('data-async-ajax-entity');
            var column     = input.attr('data-async-ajax-column');
            var entityData = input.attr('data-async-ajax-data');

            if (typeof entityData !== typeof 'undefined') {
                entityData = '';
            }
            else {
                entityData += ';';
            }

            var asyncUrl = MesdAsyncPath + 'add/' + entity + '/' + entityData + column + '+' + value;
        }
        else if ('custom' == ajaxType ) {
            var className  = input.attr('data-async-ajax-class');
            var methodName = input.attr('data-async-ajax-method');
            var classData  = input.attr('data-async-ajax-data');
            var manager    = input.attr('data-async-ajax-manager');

            classData += ';MesdAsyncFieldValue+' + value;

            var managerNeeded = ('true' == manager) ? 'true' : 'false';

            var asyncUrl =
                MesdAsyncPath + 'custom/' + className + '/' + methodName + '/' + classData + '/' + managerNeeded;
        }
        else {
            throw 'Invalid ajax type: '  + ajaxType + ' check data-async-ajax-type attribute';
        }

        // Make Async call
        $.ajax({
            url: asyncUrl,
            success: function(data, status, xhr) {
                /**
                 * If data-async-ajax-type was of type 'add', convert input
                 * field to 'update' type call
                 */
                if ('add' == ajaxType) {
                    if (data.entityId) {
                        var entityId = data.entityId;
                        input.attr('data-async-ajax-entity-id', String(entityId));
                        input.attr('data-async-ajax-type', 'update');
                        input.removeAttr('data-async-ajax-data');
                    }
                    else {
                        throw "Ajax insert/add error - please check your server side ajax url";
                    }
                }
            }
        });
    });
});



/**
 * convertToInteger()
 *
 * Converts string to integer. The function will detect negative values by
 * searching for open paren "(" or a negative sign "-" leading the string
 * numeric.
 *
 */
function convertToInteger(value) {

    // Determine if value is negative
    var negative = false;
    if ('(' == value.toString().substring(0, 1) || '-' == value.toString().substring(0, 1)) {
        negative = true;
    }

    // Strip all non-numerics, except decimal
    value = value.toString().replace(/[^0-9\.]+/g, '');

    // Convert to Float and Round
    value = Math.round(parseFloat(value));

    // Ensure proper sign
    if (negative) {
        value = value * -1;
    }

    return value
}


/**
 * convertToFloat()
 *
 * Converts string to float. The function will detect negative values by
 * searching for open paren "(" or a negative sign "-" leading the string
 * numeric.
 *
 */
function convertToFloat(value) {

    // Determine if value is negative
    var negative = false;
    if ('(' == value.toString().substring(0, 1) || '-' == value.toString().substring(0, 1)) {
        negative = true;
    }

    // Strip all non-numerics, except decimal
    value = value.toString().replace(/[^0-9\.]+/g, '');

    // Convert to float
    value = parseFloat(value);

    // Ensure proper sign
    if (negative) {
        value = value * -1;
    }

    return value
}