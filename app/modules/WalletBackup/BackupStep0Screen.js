/**
 * @version 0.2
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native'
import Icon from 'react-native-vector-icons/AntDesign'

import Button from '../../components/elements/Button'
import GradientView from '../../components/elements/GradientView'
import TextView from '../../components/elements/Text'

import Navigation from '../../components/navigation/Navigation'
import NavStore from '../../components/navigation/NavStore'

import { strings } from 'root/app/services/i18n'

import { showModal } from '../../appstores/Actions/ModalActions'
import { setWalletMnemonic } from '../../appstores/Actions/CreateWalletActions'

import BlocksoftKeys from '../../../crypto/actions/BlocksoftKeys/BlocksoftKeys'
import BlocksoftKeysStorage from '../../../crypto/actions/BlocksoftKeysStorage/BlocksoftKeysStorage'

import Log from '../../services/Log/Log'
import { copyToClipboard } from '../../services/utils'
import Copy from 'react-native-vector-icons/MaterialCommunityIcons'
import firebase from "react-native-firebase"

class BackupStep0Screen extends Component {

    constructor(props) {
        super(props)
        this.state = {
            walletMnemonic: '',
            walletMnemonicArray: []
        }
        this.skipModal = React.createRef()
    }

    async componentDidMount() {
        try {
            Log.log('WalletBackup.BackupStep0Screen.componentDidMount init')

            const { flowType, mnemonicLength } = this.props.createWalletStore

            let walletMnemonic = ''

            if (flowType === 'BACKUP_WALLET') {
                const selectedWallet = this.props.selectedWallet
                let mnemonic = 'new wallet is not generated - please reinstall and restart'
                if (selectedWallet && selectedWallet.wallet_hash) {
                    mnemonic = await BlocksoftKeysStorage.getWalletMnemonic(selectedWallet.wallet_hash)
                }
                walletMnemonic = mnemonic
            } else {
                walletMnemonic = (await BlocksoftKeys.newMnemonic(mnemonicLength)).mnemonic
            }

            const walletMnemonicArray = walletMnemonic.split(' ')

            setWalletMnemonic({ walletMnemonic })
            this.setState({
                walletMnemonic,
                walletMnemonicArray
            })

        } catch (e) {
            Log.err('WalletBackup.BackupStep0Screen.componentDidMount error ' + e.message)
        }
    }

    handleCopyModal = () => {
        const { walletMnemonic } = this.state

        copyToClipboard(walletMnemonic)

        showModal({
            type: 'INFO_MODAL',
            icon: true,
            title: strings('modal.walletBackup.success'),
            description: strings('modal.walletBackup.mnemonicCopied')
        })
    }

    onPress = () => {
        NavStore.goNext('BackupStep1Screen')
    }

    handleSkip = () => {
        showModal({ type: 'BACKUP_SKIP_MODAL' })
    }

    render() {

        firebase.analytics().setCurrentScreen('WalletBackup.BackupStep0Screen')

        const { flowType, mnemonicLength } = this.props.createWalletStore

        return (
            <GradientView style={styles.wrapper} array={styles_.array} start={styles_.start} end={styles_.end}>
                {
                    flowType === 'BACKUP_WALLET' ?
                        <Navigation
                            title={strings('walletBackup.title')}
                            isClose={false}
                        /> :
                        <Navigation
                            title={strings('walletBackup.titleNewWallet')}
                            nextTitle={strings('walletBackup.skip')}
                            next={this.handleSkip}
                        />
                }
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={styles.wrapper__scrollView}>
                    <View style={styles.wrapper__content}>
                        <TextView style={{ height: 90 }}>
                            { strings('walletBackup.description', { mnemonicLength: mnemonicLength === 256 ? 24 : 12, words: mnemonicLength === 256 ? strings('walletCreate.words24') : strings('walletCreate.words12')  })}
                        </TextView>
                        <Image
                            style={styles.img}
                            resizeMode='stretch'
                            source={require('../../assets/images/importSave.png')}
                        />
                        <View style={styles.seed}>
                            {
                                this.state.walletMnemonicArray.map((item, index) => {
                                    return (
                                        <View style={styles.seed__item} key={index}>
                                            <View style={styles.seed__index}>
                                                <Text style={styles.seed__index__text}>{ index + 1 }</Text>
                                            </View>
                                            <Text style={styles.seed__text}>{ ' ' + item }</Text>
                                        </View>
                                    )
                                })
                            }
                        </View>
                        <TouchableOpacity onPress={() => this.handleCopyModal()} style={styles.copyBtn}>
                            <Text style={styles.copyBtn__text}>
                                { strings('account.copy') }
                            </Text>
                            <Copy name="content-copy" size={18} color="#946288" />
                        </TouchableOpacity>
                        <View style={styles.warning}>
                            <Icon style={styles.warning__icon} name="warning" size={20} color="#946288"/>
                            <Text style={styles.warning__text}>{strings('walletBackup.attention')}</Text>
                        </View>
                        <Button press={this.onPress} styles={styles.btn}>
                            {strings('walletBackup.written')}
                        </Button>
                    </View>
                </ScrollView>
            </GradientView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        selectedWallet: state.mainStore.selectedWallet,
        createWalletStore: state.createWalletStore
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BackupStep0Screen)

const styles_ = {
    array: ['#fff', '#fff'],
    start: { x: 0.0, y: 0 },
    end: { x: 0, y: 1 }
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1
    },
    wrapper__scrollView: {
        marginTop: 80,
    },
    wrapper__content: {
        marginTop: 20,
        paddingLeft: 30,
        paddingRight: 30
    },
    title: {
        marginBottom: 10,
        fontSize: 24,
        fontFamily: 'SFUIDisplay-Semibold',
        color: '#404040',
        textAlign: 'center'
    },
    text: {
        textAlign: 'justify',
        fontSize: 16,
        fontFamily: 'SFUIDisplay-Regular',
        color: '#999999'
    },
    img: {
        alignSelf: 'center',
        width: 140,
        height: 200,
        marginBottom: 20
    },
    seed: {
        marginBottom: 10,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    seed__item: {
        position: 'relative',

        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 10,
        marginRight: 15,
        marginTop: 10,
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 14,
        backgroundColor: '#946288',
        color: '#fff',
        borderRadius: 8
    },
    seed__text: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 14,
        color: '#fff',
        textAlign: 'center'
    },
    seed__index: {
        position: 'absolute',
        top: -10,
        right: -10,

        padding: Platform.OS === 'android' ? 2 : 4,
        width: 20,

        textAlign: 'center',

        backgroundColor: '#fff',

        borderRadius: 20,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    seed__index__text: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 10,
        textAlign: 'center',
        color: '#404040',
    },
    warning: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 15
    },

    warning__icon: {
        marginRight: 5
    },
    warning__text: {
        marginTop: 2,
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 16,
        color: '#404040'
    },
    btn: {
        marginBottom: 50
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0,
        marginBottom: 35
    },
    copyBtn__text: {
        marginTop: 2,
        marginRight: 17,
        fontFamily: 'SFUIDisplay-Bold',
        fontSize: 10,
        color: '#946288'
    },
})
