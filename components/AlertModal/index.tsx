import React from 'react'
import { Text } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { styles } from './style';
import Modal from '../Modal';

const getIcon = (type: string) => {
    switch (type) {
        case "success":
            return <FeatherIcon name={'check-circle'} size={140} color="green" />
        case "warning":
            return <FeatherIcon name={'alert-triangle'} size={140} color="#F8BC87" />
        case "error":
            return <FeatherIcon name={'x-circle'} size={140} color="red" />
        default:
            return null;
    }
}

const AlertModal = ({visible, onClose, message, type}: AlertModal) => {

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            contentStyle={styles.modalContent}
        >
            {getIcon(type)}
            <Text style={styles.messageContent}>{message}</Text>
        </Modal>
    )
}

export default AlertModal;