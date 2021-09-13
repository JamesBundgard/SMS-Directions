/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
        '**/*.test.ts'
    ],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.{ts,js}'
    ],
    coveragePathIgnorePatterns: [
        'src/index.ts',
        'src/controllers/*'
    ]
};
