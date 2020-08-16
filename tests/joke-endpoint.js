/* eslint-disable */ // so that the CI linting process doesn't fail - this will be removed in the final revision

const settings = require("../settings");

const meta = {
    name: "Joke",
    category: "Endpoints"
};

/**
 * @typedef {Object} UnitTestResult
 * @prop {Object} meta
 * @prop {String} meta.name
 * @prop {String} meta.category
 * @prop {Array<String>} errors
 */

/**
 * Runs this unit test
 * @returns {Promise<UnitTestResult>}
 */
function run()
{
    return new Promise((resolve, reject) => {
        return reject({
            meta,
            errors: [
                "?amount=5 didn't return 5 jokes",
                "?lang=xy didn't return an \"invalid lang\" error"
            ]
        });

        // return resolve({ meta });
    });
}

module.exports = { meta, run };
