@Library('jenkins-library') _

def pipeline = new org.js.LibPipeline(
    steps: this,
    packageManager: 'pnpm',
    testCmds: ['pnpm check-code-integrity'],
    pushCmds: ['pnpm publish:all'],
    buildDockerImage: 'build-tools/node:14-ubuntu-cypress',
    npmRegistries: ['': 'npm-soramitsu-admin'],
    npmLoginEmail:'bot@soramitsu.co.jp')
pipeline.runPipeline()
