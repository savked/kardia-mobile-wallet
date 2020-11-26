import React from 'react'
import {Modal, View} from 'react-native'
import Button from '../Button'
import {styles} from './style'

const CustomModal = ({animationType = "slide", visible, onClose, children, full = false, showCloseButton = true}: CustomModalProps) => {

    return (
        <View style={styles.centeredView}>
            <Modal
                animationType={animationType}
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <View style={[styles.modalView, full ? {flex: 1} : {flex: 0.5}]}>
                    {children}
                    {showCloseButton && <Button size="small" title="Close" onPress={onClose} /> }
                </View>
            </Modal>
        </View>
    )
}

export default CustomModal;