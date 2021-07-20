@Library('jenkins-library') _

def pipeline = new org.js.LibPipeline(
    steps: this,
    packageManager: 'pnpm',
    testCmds: ['pnpm check-code-integrity'],
    pushCmds: ['pnpm publish:all'],
    dockerImageName: 'soramitsu/scale-codec-js-library',
    buildDockerImage: 'build-tools/node:14-ubuntu-cypress',
    npmRegistries: ['': 'npm-soramitsu-admin'],
    npmLoginEmail:'admin@soramitsu.co.jp')
pipeline.runPipeline()
